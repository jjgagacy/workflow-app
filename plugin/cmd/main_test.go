package main

import (
	"path/filepath"
	"testing"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

func TestPackageCachePathForPluginUniqueIdentifier(t *testing.T) {
	root := "/tmp/plugin_packages"
	identifier := "monyii/openai:1.0.0"

	want := filepath.Join(root, "monyii", "openai:1.0.0")
	if got := packageCachePathForPluginUniqueIdentifier(root, identifier); got != want {
		t.Fatalf("package cache path mismatch: got %q, want %q", got, want)
	}
}

func TestNormalizeInstallType(t *testing.T) {
	cases := []struct {
		name     string
		input    string
		expected plugin_entities.PluginRuntimeType
	}{
		{name: "empty defaults to local", input: "", expected: plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL},
		{name: "local stays local", input: "local", expected: plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL},
		{name: "remote accepted", input: "remote", expected: plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE},
		{name: "serverless accepted", input: "serverless", expected: plugin_entities.PLUGIN_RUNTIME_TYPE_SERVERLESS},
		{name: "unknown defaults to local", input: "unknown", expected: plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := normalizeInstallType(tc.input); got != tc.expected {
				t.Fatalf("normalizeInstallType(%q) = %q, want %q", tc.input, got, tc.expected)
			}
		})
	}
}
