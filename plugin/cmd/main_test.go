package main

import (
	"path/filepath"
	"testing"
)

func TestPackageCachePathForPluginUniqueIdentifier(t *testing.T) {
	root := "/tmp/plugin_packages"
	identifier := "monyii/openai:1.0.0"

	want := filepath.Join(root, "monyii", "openai:1.0.0")
	if got := packageCachePathForPluginUniqueIdentifier(root, identifier); got != want {
		t.Fatalf("package cache path mismatch: got %q, want %q", got, want)
	}
}
