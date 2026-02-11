package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

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

func TestPluginEndpoint(t *testing.T) {

}
