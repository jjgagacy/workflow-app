package parser

import (
	"bufio"
	"fmt"
	"io"
)

func LineBasedChunking(reader io.Reader, maxChunkSize int, processor func([]byte) error) error {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 1024), maxChunkSize)
	scanner.Split(bufio.ScanLines)

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) > maxChunkSize {
			return fmt.Errorf("line is too long: %d", len(line))
		}

		if err := processor(line); err != nil {
			return err
		}
	}

	return nil
}
