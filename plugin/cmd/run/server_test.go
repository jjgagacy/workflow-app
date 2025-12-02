package run

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

type MockStreamCreator struct {
	createdStream []*utils.Stream[client]
}

func (m *MockStreamCreator) CreateStream(max int) *utils.Stream[client] {
	stream := utils.NewStream[client](max)
	m.createdStream = append(m.createdStream, stream)
	return stream
}

func TestCreateStdioServerWitoDeps(t *testing.T) {
	tests := []struct {
		name        string
		reader      io.Reader
		writer      io.Writer
		wantClient  client
		description string
	}{
		{
			name:        "standard io",
			reader:      strings.NewReader("test input"),
			writer:      &bytes.Buffer{},
			description: "应该创建包含正确reader和writer的client",
		},
		{
			name:        "nil_reader",
			reader:      nil,
			writer:      &bytes.Buffer{},
			description: "应该处理nil reader",
		},
		{
			name:        "nil_writer",
			reader:      strings.NewReader("test"),
			writer:      nil,
			description: "应该处理nil writer",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			creator := &MockStreamCreator{}
			stream := CreateStdioServerWithDeps(tt.reader, tt.writer, creator)

			if len(creator.createdStream) == 0 {
				t.Fatal("No stream created")
			}

			if !stream.Next() {
				t.Fatal("No data in the stream")
			}

			clientData, err := stream.Read()
			if err != nil {
				t.Fatalf("Failed to read data: %v", err)
			}
			if clientData.reader != tt.reader {
				t.Error("Reader does not match")
			}
			if clientData.writer != tt.writer {
				t.Error("Writer does not match")
			}

			// Validate that the cancel function does not panic
			if clientData.cancel != nil {
				func() {
					defer func() {
						if r := recover(); r != nil {
							t.Errorf("cancel function panic: %v", err)
						}
					}()
					clientData.cancel()
				}()
			}
		})
	}
}

func TestCreateStdioServer_StreamBehavior(t *testing.T) {
	t.Run("stream_should_contain_one_client", func(t *testing.T) {
		reader := strings.NewReader("input")
		writer := &bytes.Buffer{}
		creator := &MockStreamCreator{}

		stream := CreateStdioServerWithDeps(reader, writer, creator)

		// 验证stream大小
		if stream.Size() != 1 {
			t.Errorf("期望stream大小为1, 实际为 %d", stream.Size())
		}

		// 验证可以读取client
		if !stream.Next() {
			t.Error("Next() 应该返回 true")
		}

		clientData, err := stream.Read()
		if err != nil {
			t.Fatalf("读取失败: %v", err)
		}

		if clientData.reader != reader {
			t.Error("reader不匹配")
		}
		if clientData.writer != writer {
			t.Error("writer不匹配")
		}

		// 验证stream现在为空
		if stream.Size() != 0 {
			t.Error("读取后stream应该为空")
		}
	})
}

type mockReadWriterCloser struct {
	*bytes.Buffer
	closed bool
}

func (m *mockReadWriterCloser) Close() error {
	m.closed = true
	return nil
}

func (m *mockReadWriterCloser) Read(p []byte) (n int, err error) {
	if m.Buffer == nil {
		return 0, io.EOF
	}
	return m.Buffer.Read(p)
}

func (m *mockReadWriterCloser) Write(p []byte) (n int, err error) {
	if m.Buffer == nil {
		return len(p), nil
	}
	return m.Buffer.Write(p)
}

func TestCreateStdioServer_CancelFunction(t *testing.T) {
	t.Run("cancel should close reader writer", func(t *testing.T) {
		reader := &mockReadWriterCloser{Buffer: bytes.NewBufferString("test")}
		writer := &mockReadWriterCloser{Buffer: &bytes.Buffer{}}

		creator := &MockStreamCreator{}
		stream := CreateStdioServerWithDeps(reader, writer, creator)
		if !stream.Next() {
			t.Fatal("stream中没有数据")
		}

		clientData, err := stream.Read()
		if err != nil {
			t.Fatalf("读取失败: %v", err)
		}

		// 执行cancel函数
		clientData.cancel()

		if !reader.closed {
			t.Error("reader应该被关闭")
		}
		if !writer.closed {
			t.Error("writer应该被关闭")
		}
	})
}

func TestCreateTCPServer(t *testing.T) {
	tests := []struct {
		name        string
		payload     *RunPluginPayload
		wantErr     bool
		description string
	}{
		{
			name: "valid_config",
			payload: &RunPluginPayload{
				TcpServerHost: "localhost",
				TcpServerPort: 0,
				RunMode:       RUN_MODE_TCP,
			},
			wantErr:     false,
			description: "should successfully create a TCP server on localhost",
		},
		{
			name: "invalid_port",
			payload: &RunPluginPayload{
				TcpServerHost: "localhost",
				TcpServerPort: 99999, // 无效端口
			},
			wantErr:     true,
			description: "应该对无效端口返回错误",
		},
		{
			name: "empty_host",
			payload: &RunPluginPayload{
				TcpServerHost: "",
				TcpServerPort: 0,
			},
			wantErr:     false,
			description: "应该处理空主机名",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			stream, err := createTCPServer(tt.payload)

			if (err != nil) != tt.wantErr { // 比较实际结果与期望结果是否不相等
				t.Errorf("createTCPServer() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.wantErr {
				if stream != nil {
					t.Error("expected stream should be nil on error")
					return
				}
			} else {
				if stream == nil {
					t.Error("the stream should not be nil")
					return
				}
			}
			if tt.payload.TcpServerPort == 0 {
				t.Error("tcp server port should be updated")
			}
			if tt.payload.TcpServerHost == "" {
				t.Error("tcp server host should be updated")
			}
			if stream != nil {
				stream.Close()
			}
		})
	}
}

func TestCreateTCPServer_ClientConnections(t *testing.T) {
	t.Run("should accept client connections", func(t *testing.T) {
		payload := &RunPluginPayload{
			TcpServerHost: "localhost",
			TcpServerPort: 0,
		}

		stream, err := createTCPServer(payload)
		if err != nil {
			t.Fatalf("Failed to create TCP server: %v", err)
		}

		serverAddr := net.JoinHostPort(payload.TcpServerHost, strconv.Itoa(payload.TcpServerPort))
		t.Logf("服务器监听地址: %s", serverAddr)

		defer stream.Close()

		var wg sync.WaitGroup
		clientCount := 3

		connected := make(chan struct{}, clientCount)

		for i := range clientCount {
			wg.Add(1)
			go func(clientNum int) {
				defer wg.Done()

				// 给服务器一点启动时间
				time.Sleep(10 * time.Millisecond)

				conn, err := net.Dial("tcp", serverAddr)
				if err != nil {
					t.Errorf("Failed to connect %d: %v", clientNum, err)
				}
				defer conn.Close()

				// send data
				testMsg := []byte("hello from client")
				_, err = conn.Write(testMsg)
				if err != nil {
					t.Errorf("send data to %d fail: %v", clientNum, err)
				}

				// 标记连接成功
				connected <- struct{}{}
				t.Logf("客户端 %d 连接成功", clientNum)

				// 保持连接一段时间，确保服务器有机会处理
				time.Sleep(50 * time.Millisecond)
			}(i)
		}

		wg.Wait()
		close(connected)
		time.Sleep(100 * time.Millisecond)

		successCount := len(connected)
		t.Logf("成功连接客户端数量: %d", successCount)

		// 给服务器足够时间处理所有连接
		time.Sleep(200 * time.Millisecond)
		receivedClients := 0
		timeout := time.After(2 * time.Second) // 设置超时

		// 这个循环有时会因为stream.Next()阻塞而无法退出，所以改用select和timeout机制
		// Verify the client connection is received in the stream
		// for stream.Next() {
		// 	clientData, err := stream.Read()
		// 	if err != nil {
		// 		t.Errorf("failed to read client: %v", err)
		// 		continue
		// 	}

		// 	// 验证client数据
		// 	if clientData.reader == nil {
		// 		t.Error("client reader不应该为nil")
		// 	}
		// 	if clientData.writer == nil {
		// 		t.Error("client writer不应该为nil")
		// 	}
		// 	if clientData.cancel == nil {
		// 		t.Error("client cancel函数不应该为nil")
		// 	}

		// 	receivedClients++
		// 	t.Logf("成功读取第 %d 个客户端", receivedClients)
		// 	// 测试cancel函数
		// 	clientData.cancel()
		// }

	readLoop:
		for {
			select {
			case <-timeout:
				t.Logf("读取超时，已接收 %d 个客户端", receivedClients)
				break readLoop
			default:
				if stream.Next() {
					clientData, err := stream.Read()
					if err != nil {
						t.Errorf("读取client失败: %v", err)
						continue
					}

					// 验证client数据
					if clientData.reader == nil {
						t.Error("client reader不应该为nil")
					}
					if clientData.writer == nil {
						t.Error("client writer不应该为nil")
					}
					if clientData.cancel == nil {
						t.Error("client cancel函数不应该为nil")
					}

					receivedClients++
					t.Logf("成功读取第 %d 个客户端", receivedClients)

					// 测试cancel函数
					clientData.cancel()

					// 如果已经读取了所有预期的客户端，就退出
					if receivedClients >= successCount {
						break readLoop
					}
				} else {
					// 没有更多数据，等待一下再重试
					time.Sleep(50 * time.Millisecond)
				}
			}
		}

		if receivedClients != clientCount {
			t.Errorf("期望接收 %d 个客户端, 实际接收 %d", clientCount, receivedClients)
		}
	})
}

func TestSimpleStdio(t *testing.T) {
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Println("程序已启动，请输入 JSON 数据（输入 'quit' 退出）:")

	for scanner.Scan() {
		input := strings.TrimSpace(scanner.Text())

		if input == "quit" {
			fmt.Println("程序已退出。")
			break
		}

		if input == "" {
			fmt.Println("请输入有效的 JSON 数据，或输入 'quit' 退出:")
			continue
		}

		var data any
		if err := json.Unmarshal([]byte(input), &data); err != nil {
			fmt.Fprintf(os.Stderr, "JSON 解析错误: %v\n", err)
			fmt.Println("请输入有效的 JSON 数据:")
			continue
		}

		formatted, err := json.MarshalIndent(data, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "JSON 格式化错误: %v\n", err)
			fmt.Println("请输入有效的 JSON 数据:")
			continue
		}

		fmt.Println("格式化后的 JSON 数据:")
		fmt.Println(string(formatted))
		fmt.Println("请输入新的 JSON 数据，或输入 'quit' 退出:")

		if err := scanner.Err(); err != nil {
			fmt.Fprintf(os.Stderr, "读取输入错误: %v\n", err)
		}
	}
}
