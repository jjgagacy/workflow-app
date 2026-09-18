package plugintest

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

// go test -timeout 15s -run ^TestRemotePluginHello$ ./test/plugin_test -v -count=1
func TestRemotePluginHello(t *testing.T) {
	url := strings.Join([]string{baseUrl + "/plugin/", tenantId, "/dispatch/tool/invoke"}, "")
	requestBody := map[string]any{
		"tenant_id": tenantId,
		"user_id":   "",
		"plugin_id": pluginId,

		"conversation_id": "",
		"message_id":      "",
		"app_id":          "",
		"endpoint_id":     "",
		"data": map[string]any{
			"provider": "telegraph",
			"tool":     "telegraph",
			"tool_parameters": map[string]any{
				"title":   "beijing",
				"content": "parameter",
			},
		},
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		t.Fatal(err)
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(jsonData))
	if err != nil {
		t.Fatal(err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Plugin-ID", pluginId)
	req.Header.Set("X-Api-Key", serverKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		t.Fatalf("unexpected status code: %d body: %s", resp.StatusCode, string(bodyBytes))
	}

	if contentType := resp.Header.Get("Content-Type"); contentType != "text/event-stream" {
		t.Fatalf("unexpected content-type: %s", contentType)
	}

	// 用 goroutine 读取 SSE 行
	lineCh := make(chan string, 8) // 带缓冲，避免 goroutine 泄漏阻塞
	errCh := make(chan error, 1)

	go func() {
		defer close(lineCh)
		reader := bufio.NewReader(resp.Body)
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					return
				}
				errCh <- err
				return
			}
			lineCh <- line
		}
	}()

	timeout := time.After(5 * time.Second)

	for {
		select {
		case <-timeout:
			t.Fatal("timeout waiting for SSE data")
		case err := <-errCh:
			t.Fatal(err)
		case line, ok := <-lineCh:
			if !ok {
				// 连接关闭，正常结束
				return
			}

			if after, ok := strings.CutPrefix(line, "data: "); ok {
				raw := strings.TrimSpace(after)

				var event map[string]any
				if err := json.Unmarshal([]byte(raw), &event); err != nil {
					t.Fatalf("invalid json: %v", err)
				}

				fmt.Printf("SSE event: %+v\n", event)

				// 收到目标事件后主动退出
				if isTargetEvent(event) {
					return
				}
			}
		}
	}
}

// 根据实际业务判断是否为目标事件
func isTargetEvent(event map[string]any) bool {
	// 例如：event["type"] == "json" 且包含 message.jsonObject
	data, ok := event["data"].(map[string]any)
	if !ok {
		return false
	}
	message, ok := data["message"].(map[string]any)
	if !ok {
		return false
	}
	_, ok = message["jsonObject"]
	return ok
}
