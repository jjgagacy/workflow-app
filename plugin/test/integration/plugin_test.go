package integration

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

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

var (
	tenantId               string = "272635fa-c96f-4ad4-b7c6-9406332ae89c"
	pluginId               string = "hello"
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier
	serverKey              string = "mn3LYe9NwIjK1janLI9nckPCgOT-+3ovajaNAjpCjbbCjc3ZtUkanPE"
)

func init() {
	var err error
	pluginUniqueIdentifier, err = plugin_entities.NewPluginUniqueIdentifier("monie/hello:1.0.0")
	if err != nil {
		panic("invalid test identifier")
	}
}

func TestInstallPlugin(t *testing.T) {
	url := strings.Join([]string{baseUrl + "/plugin/", tenantId, "/management/install/identifiers"}, "")
	requestBody := map[string]any{
		"plugin_unique_identifies": []string{string(pluginUniqueIdentifier)},
		"source":                   "local",
		"meta": []map[string]any{{
			"config":  "value1",
			"enabled": true,
		}},
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
	req.Header.Set("X-Api-Key", serverKey)

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	// assert.Equal(t, http.StatusOK, resp.StatusCode)
	var response map[string]any
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("Response: %+v\n", response)
}

func TestPluginToolInvoke(t *testing.T) {
	// wait plugin startup
	time.Sleep(3 * time.Second)

	url := strings.Join([]string{baseUrl + "/plugin/", tenantId, "/dispatch/tool/invoke"}, "")
	requestBody := map[string]any{
		"tenant_id": tenantId,
		"user_id":   "",
		"plugin_id": "hello",

		// "unique_identifier": "monie/hello:1.0.0",
		"conversation_id": "",
		"message_id":      "",
		"app_id":          "",
		"endpoint_id":     "",
		// "context": map[string]any{},
		"data": map[string]any{
			"provider": "telegraph",
			"tool":     "telegraph",
			"tool_parameters": map[string]any{
				"title":   "beijing",
				"content": "parameter",
			},
		},
		// 如果 Credentials 有字段，例如：
		// "client_id": "xx",
		// "client_key": "yy",
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

	reader := bufio.NewReader(resp.Body)

	for {
		select {
		case <-time.After(10 * time.Second):
			t.Fatal("timeout waiting for SSE data")
		default:
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					return
				}
				t.Fatal(err)
			}

			if after, ok := strings.CutPrefix(line, "data: "); ok {
				raw := after
				raw = strings.TrimSpace(raw)

				var event map[string]any
				if err := json.Unmarshal([]byte(raw), &event); err != nil {
					t.Fatalf("invalid json: %v", err)
				}

				fmt.Printf("SSE event: %+v\n", event)
			}

		}
	}
}
