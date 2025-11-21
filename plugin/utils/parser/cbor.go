package parser

import (
	"reflect"

	"github.com/fxamacker/cbor/v2"
)

var (
	cborMapType        = reflect.TypeOf(map[string]any{})
	cborDecoderOptions = cbor.DecOptions{DefaultMapType: cborMapType}

	cborDecoder cbor.DecMode
)

func init() {
	var err error
	cborDecoder, err = cborDecoderOptions.DecMode()
	if err != nil {
		panic(err)
	}
}

func CBORMarshal[T any](v T) ([]byte, error) {
	return cbor.Marshal(v)
}

func CBORUnmarshal[T any](data []byte) (T, error) {
	var v T
	err := cborDecoder.Unmarshal(data, &v)
	return v, err
}
