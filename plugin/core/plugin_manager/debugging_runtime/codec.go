package debugging_runtime

import (
	"bytes"
	"errors"

	"github.com/panjf2000/gnet/v2"
)

type codec struct {
	buf bytes.Buffer
}

func (w *codec) Decode(c gnet.Conn) ([][]byte, error) {
	size := c.InboundBuffered()
	buf := make([]byte, size)
	read, err := c.Read(buf)
	if err != nil {
		return nil, err
	}
	if read < size {
		return nil, errors.New("read less than size")
	}
	lines := w.getLines(buf)
	return lines, nil
}

func (w *codec) getLines(data []byte) [][]byte {
	w.buf.Write(data)

	buf := make([]byte, w.buf.Len())
	w.buf.Read(buf)
	w.buf.Reset()

	lines := bytes.Split(buf, []byte("\n"))

	// if last line is not completed, keep it in buffer
	if len(lines) > 0 && len(lines[len(lines)-1]) != 0 { // 处理“不完整行 / 半包数据” 示例：["hello", "world"] 将 world 缓存因为可能 worldxx (拆包)
		w.buf.Write(lines[len(lines)-1])
		lines = lines[:len(lines)-1]
	} else if len(lines) > 0 { // 清理末尾多余的空元素 示例：["hello", "world", ""] 删掉末尾这个空元素 ""
		lines = lines[:len(lines)-1]
	}
	return lines
}
