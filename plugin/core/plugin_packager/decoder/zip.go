package decoder

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type ZipPluginDecoder struct {
	PluginDecoder
	PluginDecoderHelper

	reader *zip.Reader

	sig        string
	createTime int64

	verification                          *Verification
	thirdPartySignatureVerificationConfig *ThirdPartySignatureVerificationConfig
}

type ThirdPartySignatureVerificationConfig struct {
	Enabled        bool
	PublicKeyPaths []string
}

func newZipPluginDecoder(
	binary []byte,
	thirdPartySignatureVerificationConfig *ThirdPartySignatureVerificationConfig,
) (*ZipPluginDecoder, error) {
	reader, err := zip.NewReader(bytes.NewReader(binary), int64(len(binary)))
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("read zip failed"))
	}

	decoder := &ZipPluginDecoder{
		reader:                                reader,
		thirdPartySignatureVerificationConfig: thirdPartySignatureVerificationConfig,
	}

	err = decoder.Open()
	if err != nil {
		return nil, err
	}

	if err = decoder.decode(); err != nil {
		return nil, err
	}

	if _, err := decoder.Manifest(); err != nil {
		return nil, err
	}

	return decoder, nil
}

func NewZipPluginDecoder(data []byte) (*ZipPluginDecoder, error) {
	return newZipPluginDecoder(data, nil)
}

func NewZipPluginDecoderWithConfig(data []byte, thirdPartySignatureVerificationConfig *ThirdPartySignatureVerificationConfig) (*ZipPluginDecoder, error) {
	return newZipPluginDecoder(data, thirdPartySignatureVerificationConfig)
}

func NewZipPluginDecoderWithLimitSize(data []byte, maxSize int64) (*ZipPluginDecoder, error) {
	reader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return nil, errors.Join(err, fmt.Errorf("read zip failed"))
	}

	totalSize := int64(0)
	for _, file := range reader.File {
		totalSize += int64(file.UncompressedSize64)
		if totalSize > maxSize {
			return nil, errors.New("plugin package size is too large, max size: " +
				strconv.FormatInt(maxSize, 10) + " bytes")
		}
	}

	return newZipPluginDecoder(data, nil)
}

func (z *ZipPluginDecoder) Stat(filename string) (fs.FileInfo, error) {
	file, err := z.reader.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	return file.Stat()
}

func (z *ZipPluginDecoder) Open() error {
	return nil
}

func (z *ZipPluginDecoder) Walk(fn func(filename string, dir string) error) error {
	for _, file := range z.reader.File {
		dir, filename := path.Split(file.Name)
		if err := fn(filename, dir); err != nil {
			return err
		}
	}
	return nil
}

func (z *ZipPluginDecoder) Close() error {
	return nil
}

func (z *ZipPluginDecoder) ReadFile(filename string) ([]byte, error) {
	file, err := z.reader.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	data := new(bytes.Buffer)
	_, err = data.ReadFrom(file)
	if err != nil {
		return nil, err
	}
	return data.Bytes(), nil
}

// ReadDir reads file list with dirname prefix
func (z *ZipPluginDecoder) ReadDir(dirname string) ([]string, error) {
	files := make([]string, 0)
	dirNameWithSlash := strings.TrimSuffix(dirname, "/") + "/"

	for _, file := range z.reader.File {
		if strings.HasPrefix(file.Name, dirNameWithSlash) {
			files = append(files, file.Name)
		}
	}
	return files, nil
}

func (z *ZipPluginDecoder) FileReader(filename string) (io.ReadCloser, error) {
	return z.reader.Open(filename)
}

func (z *ZipPluginDecoder) decode() error {
	// 从ZIP注释解析签名信息
	comment, err := utils.UnmarshalJson[struct {
		Signature string `json:"signature"`
		Time      int64  `json:"time"`
	}](z.reader.Comment)

	if err != nil {
		return err
	}

	var verification *Verification

	signature := comment.Signature
	time := comment.Time
	// 读取验证文件
	verifyData, err := z.ReadFile(VERIFICATION_FILE)
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return err
		}
		verification = nil
	} else {
		verificationData, err := utils.UnmarshalJsonBytes[Verification](verifyData)
		if err != nil {
			return err
		}
		verification = &verificationData
	}

	z.sig = signature
	z.createTime = time
	z.verification = verification
	return nil
}

func (z *ZipPluginDecoder) Signature() (string, error) {
	if z.sig != "" {
		return z.sig, nil
	}
	return "", nil
}

func (z *ZipPluginDecoder) CreateTime() (int64, error) {
	return z.createTime, nil
}

func (z *ZipPluginDecoder) Manifest() (plugin_entities.PluginDeclaration, error) {
	return z.PluginDecoderHelper.Manifest(z)
}

func (z *ZipPluginDecoder) Assets() (map[string][]byte, error) {
	return z.PluginDecoderHelper.Assets(z, "/")
}

func (z *ZipPluginDecoder) Checksum() (string, error) {
	return z.PluginDecoderHelper.Checksum(z)
}

func (z *ZipPluginDecoder) UniqueIdentity() (plugin_entities.PluginUniqueIdentifier, error) {
	return z.PluginDecoderHelper.UniqueIdentity(z)
}

func (z *ZipPluginDecoder) ExtractTo(dst string) error {
	if err := z.Walk(func(filename, dir string) error {
		workingPath := filepath.Join(dst, dir)
		// check directory exists
		if err := os.MkdirAll(workingPath, 0755); err != nil {
			return err
		}
		bytes, err := z.ReadFile(filepath.Join(dir, filename))
		if err != nil {
			return err
		}
		writeFile := filepath.Join(workingPath, filename)
		// copy file
		if err := os.WriteFile(writeFile, bytes, 0644); err != nil {
			return err
		}
		return nil
	}); err != nil {
		os.RemoveAll(dst)
		return errors.Join(err, fmt.Errorf("copy plugin to working plugin error: %v", err))
	}
	return nil
}

func (z *ZipPluginDecoder) CheckAssetValid() error {
	return z.PluginDecoderHelper.CheckAssetsValid(z)
}

func (z *ZipPluginDecoder) Verified() bool {
	return z.PluginDecoderHelper.verified(z)
}
