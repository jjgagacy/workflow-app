package decoder

import (
	"archive/zip"
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestData(t *testing.T) map[string][]byte {
	zipFileDir := "./test_data"
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

func createTestZipPlugin(t *testing.T) []byte {
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)
	testData := createTestData(t)

	for file, contents := range testData {
		writer, err := zipWriter.Create(file)
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

func createTestZipPluginWithVerification(t *testing.T) []byte {
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	files := createTestData(t)
	// 添加验证文件
	verificationContent := `{
	"signature": "verified-signature",
	"timestamp": 1696147200,
	"algorithm": "RSA",
	"authorized_category": "community"
}`

	files[".verification.json"] = []byte(verificationContent)

	for file, contents := range files {
		writer, err := zipWriter.Create(file)
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

func TestZipPluginDecoderBasic(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	t.Run("TestManifest", func(t *testing.T) {
		manifest, err := decoder.Manifest()
		require.NoError(t, err)

		assert.Equal(t, "test-plugin", manifest.Name)
		assert.Equal(t, "1.0.0", string(manifest.Version))
		assert.Equal(t, "测试插件", manifest.Label.ZhHans)
	})

	t.Run("TestReadFile", func(t *testing.T) {
		content, err := decoder.ReadFile("manifest.yaml")
		require.NoError(t, err)
		assert.Contains(t, string(content), "test-plugin")

		// 测试读取不存在的文件
		_, err = decoder.ReadFile("non-existent.yaml")
		assert.Error(t, err)
	})

	t.Run("TestReadDir", func(t *testing.T) {
		tools, err := decoder.ReadDir("tools")
		require.NoError(t, err)
		assert.Len(t, tools, 3)

		assert.Contains(t, tools, "tools/tool_provider.yaml")

		assets, err := decoder.ReadDir("_assets")
		require.NoError(t, err)
		assert.Len(t, assets, 3)
	})

	t.Run("TestWalk", func(t *testing.T) {
		var fileCount int
		err := decoder.Walk(func(filename, dir string) error {
			fileCount++
			return nil
		})
		require.NoError(t, err)
		assert.Greater(t, fileCount, 0)
	})
}

func TestZipPluginDecoderAssets(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	assets, err := decoder.Assets()
	require.NoError(t, err)

	assert.Len(t, assets, 3)
	assert.Equal(t, "fake-and-data", string(assets["icon.png"]))
	assert.Contains(t, string(assets["config.json"]), `"theme": "dark",`)
}

func TestZipPluginDecoderSignatureAndTime(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	signature, err := decoder.Signature()
	require.NoError(t, err)
	assert.Equal(t, "test-signature-123", signature)

	createTime, err := decoder.CreateTime()
	require.NoError(t, err)
	assert.Equal(t, int64(1696147200), createTime)
}

func TestZipPluginDecoderWithVerification(t *testing.T) {
	zipData := createTestZipPluginWithVerification(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	t.Run("TestWithVerificationFile", func(t *testing.T) {
		// 验证文件应该能被正确解析
		verifyContent, err := decoder.ReadFile(".verification.json")
		require.NoError(t, err)
		assert.Contains(t, string(verifyContent), "verified-signature")

		assert.Equal(t, AUTHORIZED_CATEGORY_COMMUNITY, decoder.verification.AuthorizedCategory)
	})
}

func TestZipPluginExtractTo(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	// 创建临时目录用于提取
	tmpDir := t.TempDir()

	err = decoder.ExtractTo(tmpDir)
	require.NoError(t, err)

	// 验证文件是否被正确提取
	manifestPath := filepath.Join(tmpDir, "manifest.yaml")
	manifestContent, err := os.ReadFile(manifestPath)
	require.NoError(t, err)
	assert.Contains(t, string(manifestContent), "test-plugin")

	toolPath := filepath.Join(tmpDir, "tools", "calculator.yaml")
	toolContent, err := os.ReadFile(toolPath)
	require.NoError(t, err)
	assert.Contains(t, string(toolContent), "Calculator")

	assetPath := filepath.Join(tmpDir, "_assets", "icon.png")
	assetContent, err := os.ReadFile(assetPath)
	require.NoError(t, err)
	assert.Equal(t, "fake-and-data", string(assetContent))
}

func TestZipPluginDecoderWithSizeLimit(t *testing.T) {
	zipData := createTestZipPlugin(t)

	// 测试大小限制
	t.Run("TestWithinSizeLimit", func(t *testing.T) {
		decoder, err := NewZipPluginDecoderWithLimitSize(zipData, 10*1024) // 10KB
		require.NoError(t, err)
		defer decoder.Close()

		manifest, err := decoder.Manifest()
		require.NoError(t, err)
		assert.Equal(t, "test-plugin", manifest.Name)
	})

	t.Run("TestExceedSizeLimit", func(t *testing.T) {
		// 创建一个大的 ZIP 文件来测试超限情况
		var largeBuffer bytes.Buffer
		largeZipBuffer := zip.NewWriter(&largeBuffer)
		// 添加一个大文件

		largeWriter, err := largeZipBuffer.Create("large_file.bin")
		require.NoError(t, err)

		largeData := make([]byte, 2*1024*1024) // 2MB
		_, err = largeWriter.Write(largeData)
		require.NoError(t, err)

		err = largeZipBuffer.Close()
		require.NoError(t, err)

		_, err = NewZipPluginDecoderWithLimitSize(largeBuffer.Bytes(), 1*1024*1024) // 1MB
		require.Error(t, err)

		assert.Contains(t, err.Error(), "plugin package size is too large")
	})
}

func TestZipDecoderInvalidCases(t *testing.T) {
	t.Run("TestInvalidZipData", func(t *testing.T) {
		invalidData := []byte("not a zip file")
		_, err := NewZipPluginDecoder(invalidData)
		require.Error(t, err)
		assert.Contains(t, err.Error(), "read zip failed")
	})

	t.Run("TestMissingManifest", func(t *testing.T) {
		var buf bytes.Buffer
		zipWriter := zip.NewWriter(&buf)

		// 不添加 manifest.yaml
		writer, err := zipWriter.Create("other_file.txt")
		require.NoError(t, err)
		_, err = writer.Write([]byte("content"))
		require.NoError(t, err)

		err = zipWriter.Close()
		require.NoError(t, err)

		_, err = NewZipPluginDecoder(buf.Bytes())
		assert.Error(t, err)
	})
}

func TestZipPluginDecoderStat(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	fileInfo, err := decoder.Stat("manifest.yaml")
	require.NoError(t, err)
	assert.False(t, fileInfo.IsDir())
	assert.Greater(t, fileInfo.Size(), int64(0))
}

func TestZipPluginDecoderUniqueIdentityAndChecksum(t *testing.T) {
	zipData := createTestZipPlugin(t)
	decoder, err := NewZipPluginDecoder(zipData)
	require.NoError(t, err)
	defer decoder.Close()

	identity, err := decoder.UniqueIdentity()
	require.NoError(t, err)
	assert.NotEmpty(t, identity)

	checksum, err := decoder.Checksum()
	require.NoError(t, err)
	assert.NotEmpty(t, checksum)
}
