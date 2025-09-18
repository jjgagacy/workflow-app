package plugin_entites

import (
	"testing"
)

func TestNewPluginUniqueIdentifier(t *testing.T) {
	tests := []struct {
		name       string
		identifier string
		wantErr    bool
	}{
		{
			name:       "valid identifier with author, id, version and checksum",
			identifier: "author/plugin-id:1.0.0@abcdef1234567890abcdef1234567890abcdef12",
			wantErr:    false,
		},
		{
			name:       "valid identifier with author and id only",
			identifier: "author/plugin-id:1.0.0",
			wantErr:    false,
		},
		{
			name:       "valid identifier with id only",
			identifier: "plugin-id",
			wantErr:    false,
		},
		{
			name:       "invalid identifier with missing plugin id",
			identifier: "author/@v1.0.0:abcdef1234567890abcdef1234567890abcdef12",
			wantErr:    true,
		},
		{
			name:       "invalid identifier with invalid characters",
			identifier: "author/plugin id@v1.0.0:abcdef1234567890abcdef1234567890abcdef12",
			wantErr:    true,
		},
		{
			name:       "invalid identifier with empty string",
			identifier: "",
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := NewPluginUniqueIdentifier(tt.identifier)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewPluginUniqueIdentifier() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

func TestPluginUniqueIdentifierMethods(t *testing.T) {
	identifier := "author/plugin-id:1.0.0@abcdef1234567890abcdef1234567890abcdef12"
	pluginUID, err := NewPluginUniqueIdentifier(identifier)
	if err != nil {
		t.Fatalf("Failed to create PluginUniqueIdentifier: %v", err)
	}

	if pluginUID.String() != identifier {
		t.Errorf("String() = %v, want %v", pluginUID.String(), identifier)
	}

	if pluginUID.PluginID() != "plugin-id" {
		t.Errorf("PluginID() = %v, want %v", pluginUID.PluginID(), "plugin-id")
	}

	if pluginUID.Checksum() != "abcdef1234567890abcdef1234567890abcdef12" {
		t.Errorf("Checksum() = %v, want %v", pluginUID.Checksum(), "abcdef1234567890abcdef1234567890abcdef12")
	}

	if pluginUID.Version() != "1.0.0" {
		t.Errorf("Version() = %v, want %v", pluginUID.Version(), "1.0.0")
	}

	if pluginUID.Author() != "author" {
		t.Errorf("Author() = %v, want %v", pluginUID.Author(), "author")
	}
}

func TestGetPluginId(t *testing.T) {
	tests := []struct {
		name       string
		identifier string
		want       string
	}{
		{
			name:       "with author, id, version and checksum",
			identifier: "author/plugin-id:1.0.0@abcdef1234567890abcdef1234567890abcdef12",
			want:       "plugin-id",
		},
		{
			name:       "with author and id only",
			identifier: "author/plugin-id:1.0.0",
			want:       "plugin-id",
		},
		{
			name:       "with id only",
			identifier: "plugin-id",
			want:       "plugin-id",
		},
		{
			name:       "with author and id only, no version",
			identifier: "author/plugin-id",
			want:       "plugin-id",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pluginUID, err := NewPluginUniqueIdentifier(tt.identifier)
			if err != nil {
				t.Fatalf("Failed to create PluginUniqueIdentifier: %v", err)
			}
			if got := pluginUID.PluginID(); got != tt.want {
				t.Errorf("PluginID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestGetAuthor(t *testing.T) {
	tests := []struct {
		name       string
		identifier string
		want       string
	}{
		{
			name:       "with author, id, version and checksum",
			identifier: "author/plugin-id:1.0.0@abcdef1234567890abcdef1234567890abcdef12",
			want:       "author",
		},
		{
			name:       "with author and id only",
			identifier: "author/plugin-id:1.0.0",
			want:       "author",
		},
		{
			name:       "with id only",
			identifier: "plugin-id",
			want:       "",
		},
		{
			name:       "with author and id only, no version",
			identifier: "author/plugin-id",
			want:       "author",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pluginUID, err := NewPluginUniqueIdentifier(tt.identifier)
			if err != nil {
				t.Fatalf("Failed to create PluginUniqueIdentifier: %v", err)
			}
			if got := pluginUID.Author(); got != tt.want {
				t.Errorf("Author() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestGetVersion(t *testing.T) {
	tests := []struct {
		name       string
		identifier string
		want       string
	}{
		{
			name:       "with author, id, version and checksum",
			identifier: "author/plugin-id:1.0.0@abcdef1234567890abcdef1234567890abcdef12",
			want:       "1.0.0",
		},
		{
			name:       "with author and id only",
			identifier: "author/plugin-id:1.0.0",
			want:       "1.0.0",
		},
		{
			name:       "with id only",
			identifier: "plugin-id",
			want:       "",
		},
		{
			name:       "with author and id only, no version",
			identifier: "author/plugin-id",
			want:       "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			pluginUID, err := NewPluginUniqueIdentifier(tt.identifier)
			if err != nil {
				t.Fatalf("Failed to create PluginUniqueIdentifier: %v", err)
			}
			if got := pluginUID.Version(); got.String() != tt.want {
				t.Errorf("Version() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRemoteLike(t *testing.T) {
	tests := []struct {
		name       string
		identifier string
		want       bool
	}{
		{
			name:       "remote plugin with UUID author",
			identifier: "123e4567-e89b-12d3-a456-426614174000/my_plugin:1.0.0",
			want:       true,
		},
		{
			name:       "local plugin with regular author",
			identifier: "jjgagacy/my_plugin:1.0.0",
			want:       false,
		},
		{
			name:       "plugin without author",
			identifier: "my_plugin:1.0.0",
			want:       false,
		},
		{
			name:       "invalid UUID format",
			identifier: "not-a-uuid/my_plugin:1.0.0",
			want:       false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, err := NewPluginUniqueIdentifier(tt.identifier)
			if err != nil {
				t.Fatalf("Failed to create plugin identifier: %v", err)
			}

			if got := p.RemoteLike(); got != tt.want {
				t.Errorf("RemoteLike() = %v, want %v", got, tt.want)
			}
		})
	}
}
