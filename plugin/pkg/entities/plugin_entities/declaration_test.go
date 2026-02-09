package plugin_entities

import (
	"testing"
)

func TestUnmarshalFSID(t *testing.T) {
	testCases := []struct {
		name          string
		fsid          string
		expectAuthor  string
		expectName    string
		expectVersion string
		expectError   bool
	}{
		{
			name:          "只有 name 和 version",
			fsid:          "myplugin-v1.0.0",
			expectAuthor:  "",
			expectName:    "myplugin",
			expectVersion: "v1.0.0",
			expectError:   false,
		},
		{
			name:          "包含 author",
			fsid:          "author--myplugin-v1.0.0",
			expectAuthor:  "author",
			expectName:    "myplugin",
			expectVersion: "v1.0.0",
			expectError:   false,
		},
		{
			name:          "包含带连字符的版本号",
			fsid:          "author--myplugin-v1.0.0-alpha",
			expectAuthor:  "author",
			expectName:    "myplugin",
			expectVersion: "v1.0.0-alpha",
			expectError:   false,
		},
		{
			name:          "name 包含连字符",
			fsid:          "my-plugin-v1.0.0",
			expectAuthor:  "",
			expectName:    "my-plugin",
			expectVersion: "v1.0.0",
			expectError:   false,
		},
		{
			name:          "author 和 name 都包含连字符",
			fsid:          "my-author--my-plugin-v1.0.0-beta.1",
			expectAuthor:  "my-author",
			expectName:    "my-plugin",
			expectVersion: "v1.0.0-beta.1",
			expectError:   false,
		},
		{
			name:          "简单的 app 和版本",
			fsid:          "test--app-0.1.0",
			expectAuthor:  "test",
			expectName:    "app",
			expectVersion: "0.1.0",
			expectError:   false,
		},
		{
			name:          "author 包含点号",
			fsid:          "org.author--plugin-v2.1.3",
			expectAuthor:  "",
			expectName:    "",
			expectVersion: "",
			expectError:   true,
		},
		{
			name:          "版本号包含多个连字符",
			fsid:          "plugin-v1.0.0-beta-2",
			expectAuthor:  "",
			expectName:    "plugin",
			expectVersion: "v1.0.0-beta-2",
			expectError:   false,
		},
		{
			name:          "空字符串",
			fsid:          "",
			expectAuthor:  "",
			expectName:    "",
			expectVersion: "",
			expectError:   true,
		},
		{
			name:          "没有连字符",
			fsid:          "invalidfsid",
			expectAuthor:  "",
			expectName:    "",
			expectVersion: "",
			expectError:   true,
		},
		{
			name:          "只有 author-- 前缀",
			fsid:          "author--",
			expectAuthor:  "",
			expectName:    "author",
			expectVersion: "-",
			expectError:   false,
		},
		{
			name:          "只有 name- 前缀",
			fsid:          "plugin-",
			expectAuthor:  "",
			expectName:    "",
			expectVersion: "",
			expectError:   true,
		},
		{
			name:          "author 后没有 name 和 version",
			fsid:          "author--name",
			expectAuthor:  "",
			expectName:    "author-",
			expectVersion: "name",
			expectError:   false,
		},
		{
			name:          "author 后有多个连字符",
			fsid:          "author---plugin-v1.0.0",
			expectAuthor:  "author-",
			expectName:    "plugin",
			expectVersion: "v1.0.0",
			expectError:   false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			author, name, version, err := UnmarshalPluginFSID(tc.fsid)

			if tc.expectError != (err != nil) {
				t.Errorf("expectError=%v, got err=%v, fsid=%s", tc.expectError, err, tc.fsid)
				return
			}

			if author != tc.expectAuthor {
				t.Errorf("Author mismatch. Expected: %q, Got: %q, fsid: %s", tc.expectAuthor, author, tc.fsid)
			}

			if name != tc.expectName {
				t.Errorf("Name mismatch. Expected: %q, Got: %q. fsid: %s", tc.expectName, name, tc.fsid)
				return
			}
			if version != tc.expectVersion {
				t.Errorf("Version mismatch. Expected: %q, Got: %q, fsid: %s", tc.expectVersion, version, tc.fsid)
				return
			}
		})

	}
}
