package decoder

import (
	"crypto/sha256"
	"encoding/hex"
	"path"
	"path/filepath"
	"slices"
)

func CalculateChecksum(decoder PluginDecoder) (string, error) {
	m := map[string][]byte{}

	sha256 := func(data []byte) []byte {
		s := sha256.New()
		s.Write(data)
		return s.Sum(nil)
	}

	if err := decoder.Walk(func(filename, dir string) error {
		var err error
		content, err := decoder.ReadFile(filepath.Join(dir, filename))
		if err != nil {
			return err
		}
		m[path.Join(dir, filename)] = sha256(content)
		return nil
	}); err != nil {
		return "", err
	}

	// sort the keys and insure the order is consistent
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	slices.Sort(keys)

	data := make([]byte, 0, len(m)*(32+32))
	for _, k := range keys {
		data = append(data, sha256([]byte(k))...)
		data = append(data, m[k]...)
	}

	return hex.EncodeToString(sha256(data)), nil
}
