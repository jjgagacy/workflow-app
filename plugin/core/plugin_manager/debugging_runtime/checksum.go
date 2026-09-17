package debugging_runtime

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func (m *RemotePluginRuntime) CalculateChecksum(files map[string][]byte) string {
	config := m.Configuration()
	buffer := bytes.Buffer{}
	binary.Write(&buffer, binary.BigEndian, utils.MarshalJsonBytes(config))
	hash := sha256.New()
	hash.Write(append(buffer.Bytes(), []byte(m.tenantId)...))
	return hex.EncodeToString(hash.Sum(nil))
}
