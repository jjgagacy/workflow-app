package local_runtime

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"sync"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

const (
	MAX_ERR_MSG_LEN        = 1024
	MAX_HEARTBEAT_INTERVAL = 120 * time.Second
)

type stdioHolder struct {
	pluginUniqueIdentifier string
	writer                 io.WriteCloser
	reader                 io.ReadCloser
	errReader              io.ReadCloser
	mu                     *sync.Mutex
	listener               map[string]func([]byte)

	started bool

	errMessage              string
	lastErrMessageUpdatedAt time.Time

	waitingControllerChan       chan bool
	waitingControllerChanClosed bool
	waitingControllerChanLock   *sync.Mutex

	// the last time the plugin sent a heartbeat
	lastActiveAt time.Time

	stdoutBufferSize    int
	stdoutMaxBufferSize int
}

type StdioHolderConfig struct {
	StdoutBufferSize    int
	StdoutMaxBufferSize int
}

func newStdioHolder(
	pluginUniqueIdentifier string,
	writer io.WriteCloser,
	reader io.ReadCloser,
	errReader io.ReadCloser,
	config *StdioHolderConfig,
) *stdioHolder {
	if config == nil {
		config = &StdioHolderConfig{}
	}

	if config.StdoutBufferSize <= 0 {
		config.StdoutBufferSize = 1024
	}
	if config.StdoutMaxBufferSize <= 0 {
		config.StdoutMaxBufferSize = 5 * 1024 * 1024
	}

	holder := &stdioHolder{
		pluginUniqueIdentifier: pluginUniqueIdentifier,
		writer:                 writer,
		reader:                 reader,
		errReader:              errReader,
		mu:                     &sync.Mutex{},

		stdoutBufferSize:          config.StdoutBufferSize,
		stdoutMaxBufferSize:       config.StdoutMaxBufferSize,
		waitingControllerChan:     make(chan bool),
		waitingControllerChanLock: &sync.Mutex{},
	}

	return holder
}

func (s *stdioHolder) setEventListener(sessionId string, listener func([]byte)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.listener == nil {
		s.listener = map[string]func([]byte){}
	}
	s.listener[sessionId] = listener
}

func (s *stdioHolder) removeEventListener(sessionId string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.listener, sessionId)
}

func (s *stdioHolder) write(data []byte) error {
	_, err := s.writer.Write(data)
	return err
}

func (s *stdioHolder) Error() error {
	if time.Since(s.lastErrMessageUpdatedAt) < 60*time.Second {
		if s.errMessage != "" {
			return errors.New(s.errMessage)
		}
	}
	return nil
}

// Stop stops the stdio, closing the channel to notify the `Wait()` function to exit
func (s *stdioHolder) Stop() {
	s.writer.Close()
	s.reader.Close()
	s.errReader.Close()

	s.waitingControllerChanLock.Lock()
	if !s.waitingControllerChanClosed {
		close(s.waitingControllerChan)
		s.waitingControllerChanClosed = true
	}
	s.waitingControllerChanLock.Unlock()
}

// StartStdout starts to read the stdout of the plugin
// it will notify the heartbeat function when the plugin is active
// and parse the stdout data to trigger corresponding listeners
func (s *stdioHolder) StartStdout(notifyHeartbeat func()) {
	s.started = true
	s.lastActiveAt = time.Now()
	defer s.Stop()

	scanner := bufio.NewScanner(s.reader)
	scanner.Buffer(make([]byte, s.stdoutBufferSize), s.stdoutMaxBufferSize)

	for scanner.Scan() {
		data := scanner.Bytes()
		if len(data) == 0 {
			continue
		}
		// update the last active time on each time the plugin sends data
		s.lastActiveAt = time.Now()

		fmt.Printf("received: %s\n", data)

		plugin_entities.ParsePluginUniversalEvent(
			data,
			"",
			func(sessionId string, data []byte) {
				s.mu.Lock()
				listener := s.listener[sessionId]
				s.mu.Unlock()
				if listener != nil {
					listener(data)
				}
			},
			func() {
				notifyHeartbeat()
			},
			func(err string) {
				utils.Error("plugin %s: %s", s.pluginUniqueIdentifier, err)
			},
			func(message string) {
				utils.Info("plugin %s: %s", s.pluginUniqueIdentifier, message)
			},
		)
	}

	if err := scanner.Err(); err != nil {
		utils.Error("plugin %s has an error on stdout: %s", s.pluginUniqueIdentifier, err)
	}
}

// WriteError writes the error message to the stdio holder
func (s *stdioHolder) WriteError(msg string) {
	if len(msg) > MAX_ERR_MSG_LEN {
		msg = msg[:MAX_ERR_MSG_LEN]
	}

	totalLen := len(s.errMessage) + len(msg)

	if totalLen > MAX_ERR_MSG_LEN {
		charsToRemove := totalLen - MAX_ERR_MSG_LEN
		if charsToRemove >= len(s.errMessage) {
			s.errMessage = ""
		} else {
			s.errMessage = s.errMessage[charsToRemove:]
		}
	}

	s.errMessage += msg
	s.lastErrMessageUpdatedAt = time.Now()
}

// StartStderr starts to read the stderr of the plugin
// it will write the error message to the stdio holder
func (s *stdioHolder) StartStderr() {
	for {
		buf := make([]byte, 1024)
		n, err := s.errReader.Read(buf)
		if err != nil && err != io.EOF {
			break
		} else if err != nil {
			s.WriteError(fmt.Sprintf("%s\n", buf[:n]))
			break
		}

		if n > 0 {
			s.WriteError(fmt.Sprintf("%s\n", buf[:n]))
		}
	}
}

// Wait waits for the plugin to exit
// it will return error when the plugin is not active
func (s *stdioHolder) Wait() error {
	s.waitingControllerChanLock.Lock()
	if s.waitingControllerChanClosed {
		s.waitingControllerChanLock.Unlock()
		return errors.New("you need to start the health check before waiting")
	}
	s.waitingControllerChanLock.Unlock()

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	// check status of plugin every 5 seconds
	for {
		s.waitingControllerChanLock.Lock()
		if s.waitingControllerChanClosed {
			s.waitingControllerChanLock.Unlock()
			break
		}
		s.waitingControllerChanLock.Unlock()

		select {
		case <-ticker.C:
			// check heartbeat
			if time.Since(s.lastActiveAt) > MAX_HEARTBEAT_INTERVAL {
				utils.Error("plugin %s is not active in %f seconds", s.pluginUniqueIdentifier, time.Since(s.lastActiveAt).Seconds())
				return types.ErrPluginNotActive
			}
		case <-s.waitingControllerChan:
			return s.Error()
		}
	}

	return nil
}
