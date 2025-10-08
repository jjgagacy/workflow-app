package plugin_packager

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestData(t *testing.T) map[string][]byte {
	zipFileDir := "./decoder/test_data"
	files := make(map[string][]byte)

	err := filepath.WalkDir(zipFileDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			files[strings.TrimPrefix(path, "test_data/")], err = os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
		}
		return nil
	})

	if err != nil {
		t.Fatal(err)
	}

	return files
}

func TestPackagerPackSuccess(t *testing.T) {
	dir := "./decoder/test_data"
	dec, err := decoder.NewFSPluginDecoder(dir)
	require.NoError(t, err)

	packager := NewPackager(dec)

	// 测试打包成功
	data, err := packager.Pack(10 * 1024 * 1024) // 10MB
	require.NoError(t, err)
	assert.NotNil(t, data)

	zipReader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	require.NoError(t, err)

	// 检查文件是否都被打包
	expectedFiles := map[string]bool{
		"manifest.yaml":         false,
		"tools/calculator.yaml": false,
		"_assets/icon.png":      false,
	}

	for _, file := range zipReader.File {
		expectedFiles[file.Name] = true
	}

	for file, found := range expectedFiles {
		assert.True(t, found, "File %s should be in the package", file)
	}

	// 验证文件内容
	for _, file := range zipReader.File {
		reader, err := file.Open()
		require.NoError(t, err)
		content, err := io.ReadAll(reader)
		require.NoError(t, err, "failed to read file content: %s", file.Name)
		reader.Close()

		assert.Greater(t, len(content), 0)
	}
}

func createTestZipPlugin(t *testing.T) []byte {
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)
	zipData := createTestData(t)

	for file, contents := range zipData {
		writer, err := zipWriter.Create(strings.TrimPrefix(file, "decoder/test_data/"))
		require.NoError(t, err)
		_, err = writer.Write(contents)
		require.NoError(t, err)
	}

	// 设置 ZIP 注释（包含签名信息）
	comment := `{"signature": "test-signature-123", "time": 1696147200}`
	zipWriter.SetComment(comment)

	err := zipWriter.Close()
	require.NoError(t, err)

	return buf.Bytes()
}

func TestPackagerZipPackSuccess(t *testing.T) {
	zipData := createTestZipPlugin(t)
	dec, err := decoder.NewZipPluginDecoder(zipData)
	require.NoError(t, err)

	packager := NewPackager(dec)

	// 测试打包成功
	data, err := packager.Pack(10 * 1024 * 1024) // 10MB
	require.NoError(t, err)
	assert.NotNil(t, data)

	zipReader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	require.NoError(t, err)

	// 检查文件是否都被打包
	expectedFiles := map[string]bool{
		"manifest.yaml":         false,
		"tools/calculator.yaml": false,
		"_assets/icon.png":      false,
	}

	for _, file := range zipReader.File {
		expectedFiles[file.Name] = true
	}

	for file, found := range expectedFiles {
		assert.True(t, found, "File %s should be in the package", file)
	}

	// 验证文件内容
	for _, file := range zipReader.File {
		reader, err := file.Open()
		require.NoError(t, err)
		if file.FileInfo().Name() == "config.json" {
			continue
		}
		content, err := io.ReadAll(reader)
		require.NoError(t, err, "failed to read file content: %s", file.Name)
		reader.Close()

		assert.Greater(t, len(content), 0)
	}
}

func createTestZipPluginLargeFile(t *testing.T) []byte {
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)
	zipData := createTestData(t)

	zipData["large-file1.bin"] = make([]byte, 6000) // 6000 bytes
	zipData["large-file2.bin"] = make([]byte, 4000) // 4000 bytes

	for file, contents := range zipData {
		writer, err := zipWriter.Create(strings.TrimPrefix(file, "decoder/test_data/"))
		require.NoError(t, err)
		_, err = writer.Write(contents)
		require.NoError(t, err)
	}

	// 设置 ZIP 注释（包含签名信息）
	comment := `{"signature": "test-signature-123", "time": 1696147200}`
	zipWriter.SetComment(comment)

	err := zipWriter.Close()
	require.NoError(t, err)

	return buf.Bytes()
}

func TestPackagerExceedSize(t *testing.T) {
	zipData := createTestZipPluginLargeFile(t)
	dec, err := decoder.NewZipPluginDecoder(zipData)
	require.NoError(t, err)

	packager := NewPackager(dec)
	packData, err := packager.Pack(1024) // 1Kb
	require.Error(t, err)
	assert.Nil(t, packData)

	// 验证错误信息包含文件大小信息
	assert.Contains(t, err.Error(), "Plugin package size is too large")
	assert.Contains(t, err.Error(), "name: large-file1.bin, size: 6000 bytes")
	assert.Contains(t, err.Error(), "name: large-file2.bin, size: 4000 bytes")
}

// MockDecoder 模拟 PluginDecoder 接口
type MockDecoder struct {
	files map[string][]byte
}

// CreateTime implements decoder.PluginDecoder.
func (m *MockDecoder) CreateTime() (int64, error) {
	panic("unimplemented")
}

// FileReader implements decoder.PluginDecoder.
func (m *MockDecoder) FileReader(filename string) (io.ReadCloser, error) {
	panic("unimplemented")
}

// Open implements decoder.PluginDecoder.
func (m *MockDecoder) Open() error {
	panic("unimplemented")
}

// Signature implements decoder.PluginDecoder.
func (m *MockDecoder) Signature() (string, error) {
	panic("unimplemented")
}

// Stat implements decoder.PluginDecoder.
func (m *MockDecoder) Stat(filename string) (fs.FileInfo, error) {
	panic("unimplemented")
}

func NewMockDecoder() *MockDecoder {
	return &MockDecoder{
		files: make(map[string][]byte),
	}
}

func (m *MockDecoder) AddFile(path string, content []byte) {
	m.files[path] = content
}

func (m *MockDecoder) ReadFile(path string) ([]byte, error) {
	content, ok := m.files[path]
	if !ok {
		return nil, fmt.Errorf("file not found: %s\n", path)
	}
	return content, nil
}

func (m *MockDecoder) ReadDir(dir string) ([]string, error) {
	var files []string
	for path := range m.files {
		if strings.HasPrefix(path, dir+"/") || (dir == "" && !strings.Contains(path, "/")) {
			files = append(files, path)
		}
	}
	return files, nil
}

func (m *MockDecoder) Walk(fn func(filename, dir string) error) error {
	for path := range m.files {
		dir := filepath.Dir(path)
		filename := filepath.Base(path)
		if err := fn(filename, dir); err != nil {
			return err
		}
	}
	return nil
}

func (m *MockDecoder) Close() error {
	return nil
}

func (m *MockDecoder) Checksum() (string, error) {
	return "mock-checksum", nil
}

func (m *MockDecoder) Manifest() (plugin_entities.PluginDeclaration, error) {
	return plugin_entities.PluginDeclaration{}, nil
}

func (m *MockDecoder) Assets() (map[string][]byte, error) {
	return nil, nil
}

func (m *MockDecoder) UniqueIdentity() (plugin_entities.PluginUniqueIdentifier, error) {
	return "mock-identity", nil
}

func (m *MockDecoder) CheckAssetValid() error {
	return nil
}

func (m *MockDecoder) Verified() bool {
	return true
}
