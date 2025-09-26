package basic_runtime

import (
	"os"

	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
)

type BasicChecksum struct {
	MediaTransport

	WorkingPath string
	Decoder     decoder.PluginDecoder

	checksumValue string
}

func (r *BasicChecksum) doChecksum() (string, error) {
	checksum, err := r.Decoder.Checksum()
	if err != nil {
		return "", err
	}

	return checksum, nil
}

func (r *BasicChecksum) Checksum() (string, error) {
	if r.checksumValue == "" {
		checksum, err := r.doChecksum()
		if err != nil {
			return "", err
		}
		r.checksumValue = checksum
	}

	return r.checksumValue, nil
}

func (r *BasicChecksum) Cleanup() {
	os.RemoveAll(r.WorkingPath)
}
