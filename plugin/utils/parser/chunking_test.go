package parser

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func createTestData() []byte {
	buf := bytes.NewBuffer(nil)

	// Hello
	packet1 := []byte{
		0x7f, 0x00, // magic + reserved
		0x0a, 0x00, // header length = 10
		0x05, 0x00, 0x00, 0x00, // data length = 5 - Hello
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // reserved
		'H', 'e', 'l', 'l', 'o',
	}

	// 数据包2: "World" (5字节)
	packet2 := []byte{
		0xAB, 0x00,
		0x0A, 0x00,
		0x05, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		'W', 'o', 'r', 'l', 'd',
	}

	buf.Write(packet1)
	buf.Write(packet2)
	return buf.Bytes()
}

func createTestPacket(magicNumber byte, data []byte) []byte {
	buf := bytes.NewBuffer(nil)

	// header length
	lengthFields := make([]byte, 4)
	lengthFields[0] = magicNumber                            // magic number
	lengthFields[1] = 0x00                                   // reserved
	binary.LittleEndian.PutUint16(lengthFields[2:4], 0x000a) // header length (little endian | 0 | 0 | 0a | 00)
	buf.Write(lengthFields)
	// data length
	header := make([]byte, 10)
	binary.LittleEndian.PutUint32(header[:4], uint32(len(data)))
	// header[4:10] reserved fields
	buf.Write(header)

	buf.Write(data)
	return buf.Bytes()
}

func createMultiPacketData(magicNumber byte, packets [][]byte) []byte {
	buf := bytes.NewBuffer(nil)
	for _, data := range packets {
		buf.Write(createTestPacket(magicNumber, data))
	}
	return buf.Bytes()
}

func TestLengthPrefixedChunking_Basic(t *testing.T) {
	testData := [][]byte{
		[]byte("Hello"),
		[]byte("Workd"),
		[]byte("Test Data"),
	}

	data := createMultiPacketData(0x7f, testData)
	reader := bytes.NewReader(data)

	var received [][]byte
	processor := func(chunk []byte) error {
		dataCopy := make([]byte, len(chunk))
		copy(dataCopy, chunk)
		received = append(received, dataCopy)
		return nil
	}

	err := LengthPrefixedChunking(reader, 0x7f, 1024, processor)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if len(received) != len(testData) {
		t.Fatalf("Expected %d chunks, got %d", len(testData), len(received))
	}

	for i, expected := range testData {
		if !bytes.Equal(received[i], expected) {
			t.Errorf("Chunk %d: expected %s, got %s", i, string(expected), string(received[i]))
		}
	}
}

func TestLengthPrefixedChunking_MagicNumber(t *testing.T) {
	// 只写入部分数据
	data := createTestPacket(0xAC, []byte("Hello"))
	reader := bytes.NewReader(data)

	err := LengthPrefixedChunking(reader, 0xAB, 1024, func(chunk []byte) error {
		return nil
	})

	if err == nil {
		t.Fatal("Expected read error for magic number, but got none")
	}

	require.ErrorContains(t, err, "magic number mismatch")
}

func TestLengthPrefixedChunking_IncompleteData(t *testing.T) {
	// 只写入部分数据
	data := createTestPacket(0xAB, []byte("Hello"))
	incompleteData := data[:8] // 只包含长度字段和部分头部

	reader := bytes.NewReader(incompleteData)

	err := LengthPrefixedChunking(reader, 0xAB, 1024, func(chunk []byte) error {
		return nil
	})

	if err == nil {
		t.Fatal("Expected read error for incomplete data, but got none")
	}

	// 应该包含 "failed to read header" 错误
	require.ErrorContains(t, err, "failed to read header")
}

// Concurrent test
func TestLengthPrefixedChunking_ConcurrentSafety(t *testing.T) {
	var testPackets [][]byte
	for i := range 1000 {
		testPackets = append(testPackets, fmt.Appendf(nil, "Packet-%d", i))
	}
	data := createMultiPacketData(0xab, testPackets)

	var wg sync.WaitGroup
	var mu sync.Mutex
	receivedCount := make(map[int]int)
	errors := make([]error, 0)

	for i := range 10 {
		wg.Go(func() {
			reader := bytes.NewReader(data)
			localReceived := 0

			err := LengthPrefixedChunking(reader, 0xab, 1024, func(chunk []byte) error {
				localReceived++
				return nil
			})

			mu.Lock()
			defer mu.Unlock()

			receivedCount[i] = localReceived
			if err != nil {
				errors = append(errors, fmt.Errorf("goroutine %d: %v", i, err))
			}
		})
	}

	wg.Wait()

	if len(errors) > 0 {
		t.Fatalf("Concurrent execution failed with errors: %v", errors)
	}

	expectedCount := len(testPackets)
	for id, count := range receivedCount {
		if count != expectedCount {
			t.Errorf("Goroutine %d processed %d packets, expected %d", id, count, expectedCount)
		}
	}
}

func TestLengthPrefixedChunking_LargeData(t *testing.T) {
	// 创建接近最大限制的数据
	largeData := make([]byte, 1000) // 接近 1024 限制
	for i := range largeData {
		largeData[i] = byte(i % 256)
	}

	data := createTestPacket(0xAB, largeData)
	reader := bytes.NewReader(data)

	var received []byte
	err := LengthPrefixedChunking(reader, 0xAB, 1024, func(chunk []byte) error {
		received = make([]byte, len(chunk))
		copy(received, chunk)
		return nil
	})

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if !bytes.Equal(received, largeData) {
		t.Error("Large data was not processed correctly")
	}
}

func TestLengthPrefixedChunking_DataLengthExceeded(t *testing.T) {
	largeData := make([]byte, 2048) // 2KB data
	data := createTestPacket(0xAB, largeData)
	reader := bytes.NewReader(data)

	err := LengthPrefixedChunking(reader, 0xAB, 1024, func(chunk []byte) error {
		return nil
	})

	if err == nil {
		t.Fatal("Expected data length exceeded error, but got none")
	}

	expectedError := "data length is too long: 2048"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestLengthPrefixedChunking_ThreadSafety(t *testing.T) {
	var testData [][]byte
	for i := range 1000 {
		testData = append(testData, fmt.Appendf(nil, "Packet-%d", i))
	}
	data := createMultiPacketData(0xab, testData)

	var (
		wg              sync.WaitGroup
		mu              sync.Mutex
		received        [][]byte
		activeCount     int
		maxActive       int
		concurrentCalls int
	)

	processChan := make(chan []byte, len(testData))
	doneChan := make(chan bool, len(testData))

	numWorkers := 3
	for i := range numWorkers {
		wg.Add(1)
		go func(workId int) {
			defer wg.Done()

			for chunk := range processChan {
				mu.Lock()
				activeCount++
				if activeCount > maxActive {
					maxActive = activeCount
				}
				if activeCount > 1 {
					concurrentCalls++
					t.Logf("concurrent worker %d processing", workId)
				}
				currentActive := activeCount
				mu.Unlock()

				// 模拟处理时间，增加并发可能性
				// 这里故意让处理时间比读取时间长
				time.Sleep(10 * time.Millisecond)

				dataCopy := make([]byte, len(chunk))
				copy(dataCopy, chunk)

				mu.Lock()
				received = append(received, dataCopy)
				activeCount--
				mu.Unlock()

				doneChan <- true

				t.Logf("Worker %d finished processing, concurrent count during processing: %d", workId, currentActive)
			}
		}(i)
	}

	// Execute LengthPrefixedChunking in the main goroutine
	reader := bytes.NewReader(data)
	err := LengthPrefixedChunking(reader, 0xab, 1024, func(chunk []byte) error {
		processChan <- chunk
		return nil
	})

	if err != nil {
		t.Fatalf("LengthPrefixedChunking failed: %v", err)
	}

	// 等待所有数据处理完成
	for i := 0; i < len(testData); i++ {
		<-doneChan
	}

	close(processChan)
	wg.Wait()
	close(doneChan)

	// 验证结果
	if len(received) != len(testData) {
		t.Errorf("期望处理 %d 个数据包，实际处理 %d 个", len(testData), len(received))
	}

	t.Logf("最大并发处理器数: %d", maxActive)
	t.Logf("并发调用次数: %d", concurrentCalls)

	if concurrentCalls == 0 {
		t.Log("⚠️ 没有检测到真正的并发调用，处理器可能是顺序执行的")
	} else {
		t.Log("✅ 检测到真正的并发处理器调用")
	}
}
