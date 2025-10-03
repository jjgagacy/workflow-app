package local_sentry

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"
)

func readLogFile(filename string) ([]string, error) {
	content, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	return strings.Split(string(content), "\n\n"), nil
}

func cleanupLogFile(filenname string) {
	os.Remove(filenname)
}

func NewError(format string, args ...any) error {
	return fmt.Errorf(format, args...)
}

func TestLocalSentryBasic(t *testing.T) {
	testFile := "basic.log"
	defer cleanupLogFile(testFile)

	l, err := NewLocalSentry(testFile)
	if err != nil {
		t.Fatalf("Failed to create localSentry: %v", err)
	}
	defer l.Close()

	testErr := NewError("database connection failed")
	extras := map[string]any{
		"operation": "user_login",
		"user_id":   12345,
		"attempts":  3,
	}

	l.CatpureException(testErr, extras)

	time.Sleep(100 * time.Millisecond)

	content, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("Failed to read log file: %v", err)
	}

	if !strings.Contains(string(content), "database connection failed") {
		t.Error("Error message not found in log file")
	}

	if !strings.Contains(string(content), "user_login") {
		t.Error("Extra information not found in log file")
	}

	var event map[string]any
	lines := strings.Split(string(content), "\n")
	for i, line := range lines {
		if strings.Contains(line, "{") {
			jsonStr := strings.Join(lines[i:], "\n")
			if err := json.Unmarshal([]byte(jsonStr), &event); err != nil {
				t.Errorf("Invalid JSON format: %v", err)
			}
			break
		}
	}

	if event["level"] != "error" {
		t.Errorf("Expected level 'error', got '%v'", event["level"])
	}
}
