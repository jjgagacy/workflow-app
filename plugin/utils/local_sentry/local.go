package local_sentry

import (
	"encoding/json"
	"log"
	"os"
	"runtime"
	"time"
)

type LocalSentry struct {
	file *os.File
}

type LocalEvent struct {
	Level      string            `json:"level"`
	Message    string            `json:"message"`
	Timestamp  time.Time         `json:"time"`
	Extra      map[string]any    `json:"extra,omitempty"`
	Tags       map[string]string `json:"tags,omitempty"`
	Stacktrace string            `json:"stacktrace,omitempty"`
}

func NewLocalSentry(filename string) (*LocalSentry, error) {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}

	return &LocalSentry{file: file}, nil
}

func (l *LocalSentry) CatureMessage(message string, extras ...map[string]any) {
	event := LocalEvent{
		Level:     "info",
		Message:   message,
		Timestamp: time.Now(),
	}

	if len(extras) > 0 {
		event.Extra = extras[0]
	}

	l.writeEvent(event)
}

func (l *LocalSentry) CatpureException(err error, extras ...map[string]any) {
	stacktrace := make([]byte, 1024)
	length := runtime.Stack(stacktrace, false)

	event := LocalEvent{
		Level:      "error",
		Timestamp:  time.Now(),
		Message:    err.Error(),
		Stacktrace: string(stacktrace[:length]),
	}

	if len(extras) > 0 {
		event.Extra = extras[0]
	}

	l.writeEvent(event)
}

func (l *LocalSentry) writeEvent(event LocalEvent) {
	data, err := json.MarshalIndent(event, "", " ")
	if err != nil {
		log.Printf("Failed to marshal event: %v", err)
		return
	}

	l.file.WriteString("=== ERROR EVENT ===\n")
	l.file.Write(data)
	l.file.WriteString("\n\n")
	l.file.Sync()
}

func (l *LocalSentry) Close() error {
	return l.file.Close()
}
