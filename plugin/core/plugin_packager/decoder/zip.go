package decoder

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"strconv"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type ZipPluginDecoder struct {
	PluginDecoder
	PluginDecoderHelper

	reader *zip.Reader
	err    error

	sig        string
	createTime int64

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
		err:                                   err,
		thirdPartySignatureVerificationConfig: thirdPartySignatureVerificationConfig,
	}

	err = decoder.Open()
	if err != nil {
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
	panic("not impl")
}

func (z *ZipPluginDecoder) Open() error {

	panic("not impl")
}

func (z *ZipPluginDecoder) Walk(fn func(filename string, dir string) error) error {
	panic("not impl")
}

func (z *ZipPluginDecoder) Close() error {
	return nil
}

func (z *ZipPluginDecoder) ReadFile(filename string) ([]byte, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) ReadDir(dirname string) ([]string, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) FileReader(filename string) (io.ReadCloser, error) {
	return z.reader.Open(filename)
}

func (z *ZipPluginDecoder) decode() error {
	panic("not impl")
}

func (z *ZipPluginDecoder) Signature() (string, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) CreateTime() (int64, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) Manifest() (plugin_entities.PluginDeclaration, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) Assets() (map[string][]byte, error) {

	panic("not impl")
}

func (z *ZipPluginDecoder) Checksum() (string, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) UniqueIdentity() (plugin_entities.PluginUniqueIdentifier, error) {
	panic("not impl")
}

func (z *ZipPluginDecoder) ExtractTo(dst string) error {
	panic("not impl")
}

func (z *ZipPluginDecoder) CheckAssetValid() error {
	panic("not impl")
}

func (z *ZipPluginDecoder) Verified() bool {
	panic("not impl")
}
