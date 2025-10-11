package local_runtime

import (
	"encoding/json"
	"io"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestStdioHolder(t *testing.T) {
	t.Run("basic creation", func(t *testing.T) {
		pr, pw := io.Pipe()
		errPr, _ := io.Pipe()

		holder := newStdioHolder(
			"test-plugin",
			pw,
			pr,
			errPr,
			&StdioHolderConfig{
				StdoutBufferSize:    1024,        // 1KB
				StdoutMaxBufferSize: 1024 * 1024, // 1MB
			},
		)

		require.NotNil(t, holder)
		assert.Equal(t, "test-plugin", holder.pluginUniqueIdentifier)
	})

	t.Run("event listener management", func(t *testing.T) {
		pr, pw := io.Pipe()
		defer pw.Close()
		defer pr.Close()

		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		// Test adding listener
		called := false
		holder.setEventListener("session1", func(data []byte) {
			called = true
			assert.Equal(t, "test data", string(data))
		})

		// Trigger listener
		holder.mu.Lock()
		listener := holder.listener["session1"]
		holder.mu.Unlock()

		assert.NotNil(t, listener)
		listener([]byte("test data"))
		assert.True(t, called)

		// Test removing listener
		holder.removeEventListener("session1")
		holder.mu.Lock()
		listener = holder.listener["session1"]
		holder.mu.Unlock()
		assert.Nil(t, listener)
	})

	t.Run("write data", func(t *testing.T) {
		pr, pw := io.Pipe()
		defer pw.Close()
		defer pr.Close()

		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		// Test writing data
		readDone := make(chan struct{})
		var readData []byte
		go func() {
			defer close(readDone)

			buf := make([]byte, 1024)
			n, err := pr.Read(buf)
			if err != nil && err != io.EOF {
				t.Logf("Read error: %v", err)
				return
			}
			readData = buf[:n]
		}()

		// 写入测试数据
		testData := []byte("hello world")
		err := holder.write(testData)
		assert.NoError(t, err)

		// 等待读取完成或超时
		select {
		case <-readDone:
			assert.Equal(t, testData, readData)
		case <-time.After(1 * time.Second):
			t.Error("Timeout waiting for pipe read")
		}
	})

	t.Run("error handling", func(t *testing.T) {
		pr, pw := io.Pipe()
		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		holder.WriteError("error message")
		assert.Equal(t, "error message", holder.errMessage)
		assert.WithinDuration(t, time.Now(), holder.lastErrMessageUpdatedAt, time.Second)

		// Test error retrieval
		err := holder.Error()
		require.Error(t, err)
		assert.Equal(t, "error message", err.Error())

		// Test error message trunction
		longMsg := strings.Repeat("a", MAX_ERR_MSG_LEN+100)
		holder.WriteError(longMsg)
		assert.Len(t, holder.errMessage, MAX_ERR_MSG_LEN)
	})

	t.Run("stdout processing", func(t *testing.T) {
		pr, pw := io.Pipe()
		errPr, _ := io.Pipe()
		defer errPr.Close()

		holder := newStdioHolder("test-plugin", pw, pr, errPr, nil)

		var wg sync.WaitGroup

		heartbeatCalled := false

		wg.Go(func() {
			holder.StartStdout(func() {
				heartbeatCalled = true
			})
		})

		// Write test data to stdout
		testData := getEventLogData("")
		err := holder.write([]byte(testData))
		require.NoError(t, err)

		// Give some time for processing
		time.Sleep(1 * time.Second)
		pw.Close()

		wg.Wait()
		assert.True(t, holder.started)
		assert.False(t, heartbeatCalled) // 因为没有发送 PLUGIN_EVENT_HEARTBEAT 消息
	})

	t.Run("test session event parsing", func(t *testing.T) {
		sessionMessage := map[string]any{
			"type": "stream",
			"data": map[string]any{
				"chunk":   1,
				"total":   5,
				"message": "stream data",
			},
		}
		sessionData, _ := json.Marshal(sessionMessage)

		event := plugin_entities.PluginUniversalEvent{
			Event:     plugin_entities.PLUGIN_EVENT_SESSION,
			SessionId: "session-123",
			Data:      sessionData,
		}
		eventData, _ := json.Marshal(event)

		sessionHandlerCalled := false
		plugin_entities.ParsePluginUniversalEvent(
			eventData,
			"test",
			func(sessionId string, data []byte) {
				sessionHandlerCalled = true
				assert.Equal(t, "session-123", sessionId)

				var msg map[string]any
				err := json.Unmarshal(data, &msg)
				assert.NoError(t, err)
				assert.Equal(t, "stream", msg["type"])
			},
			func() {
				t.Error("Should not call heartbeat handler for session event")
			},
			func(err string) {
				t.Errorf("Error handler should not be called: %s", err)
			},
			func(message string) {
				t.Error("Should not call info handler for session event")
			},
		)

		assert.True(t, sessionHandlerCalled)
	})

	t.Run("test error event parsing", func(t *testing.T) {
		event := plugin_entities.PluginUniversalEvent{
			Event:     plugin_entities.PLUGIN_EVENT_ERROR,
			SessionId: "",
			Data:      json.RawMessage(`"Test error message"`),
		}
		eventData, _ := json.Marshal(event)

		errorHandlerCalled := false
		plugin_entities.ParsePluginUniversalEvent(
			eventData,
			"test",
			func(sessionId string, data []byte) {
				t.Error("Should not call session handler for error event")
			},
			func() {
				t.Error("Should not call heartbeat handler for error event")
			},
			func(err string) {
				errorHandlerCalled = true
				assert.Equal(t, "\"Test error message\"", err)
			},
			func(message string) {
				t.Error("Should not call info handler for error event")
			},
		)
		assert.True(t, errorHandlerCalled)
	})

	t.Run("test invalid json handling", func(t *testing.T) {
		invalidData := []byte(`{"invalid": json, syntax}`)

		errorHandlerCalled := false
		plugin_entities.ParsePluginUniversalEvent(
			invalidData,
			"test-status",
			func(sessionId string, data []byte) {
				t.Error("Should not call session handler for invalid JSON")
			},
			func() {
				t.Error("Should not call heartbeat handler for invalid JSON")
			},
			func(err string) {
				errorHandlerCalled = true
				assert.Contains(t, err, "invalid character")
				assert.Contains(t, err, "test-status")
			},
			func(message string) {
				t.Error("Should not call info handler for invalid JSON")
			},
		)
		assert.True(t, errorHandlerCalled)
	})
}

func getEventLogData(sessionId string) []byte {
	logData := map[string]any{
		"message":   "this is a log message",
		"level":     "info",
		"timestamp": time.Now().Unix(),
	}
	data, _ := json.Marshal(logData)

	event := plugin_entities.PluginUniversalEvent{
		Event:     plugin_entities.PLUGIN_EVENT_LOG,
		SessionId: sessionId,
		Data:      data,
	}

	eventData, _ := json.Marshal(event)
	return eventData
}

func TestStdioHolderWait(t *testing.T) {
	t.Run("wait with immediate stop", func(t *testing.T) {
		pr, pw := io.Pipe()
		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		// 在单独的 goroutine 中立即停止
		go func() {
			time.Sleep(50 * time.Millisecond)
			holder.Stop()
		}()

		start := time.Now()
		err := holder.Wait()
		duration := time.Since(start)

		assert.NoError(t, err)
		assert.True(t, duration < 1*time.Second, "Should return quickly after stop")
	})

	t.Run("wait after stop", func(t *testing.T) {
		pr, pw := io.Pipe()
		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		holder.Stop()

		err := holder.Wait()
		assert.Error(t, err, "Wait should error after stop")
	})

	t.Run("wait with heartbeat timeout", func(t *testing.T) {
		pr, pw := io.Pipe()
		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		// 设置最后活动时间为很久以前，触发心跳超时
		holder.lastActiveAt = time.Now().Add(-MAX_HEARTBEAT_INTERVAL - time.Second)
		err := holder.Wait() // return types.ErrPluginNotActive after ticker 5 seconds

		assert.Error(t, err)
		assert.Equal(t, types.ErrPluginNotActive, err)
	})

	t.Run("wait with recent heartbeat", func(t *testing.T) {
		pr, pw := io.Pipe()
		holder := newStdioHolder("test-plugin", pw, pr, pr, nil)

		// 设置最近的活动时间
		holder.lastActiveAt = time.Now().Add(-10 * time.Second)

		// 在单独的 goroutine 中等待并停止
		done := make(chan error, 1)
		go func() {
			done <- holder.Wait()
		}()

		// 等待一小段时间后停止
		time.Sleep(100 * time.Millisecond)
		holder.Stop()

		select {
		case err := <-done:
			assert.NoError(t, err)
		case <-time.After(1 * time.Second):
			t.Error("Wait should complete after stop")
		}
	})
}
