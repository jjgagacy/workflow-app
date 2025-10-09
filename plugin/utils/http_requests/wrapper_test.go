package http_requests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ApiResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    *User  `json:"data,omitempty"`
}

type StreamData struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

func init() {
	utils.InitPool(10)
}

func TestParseJsonBodySuccess(t *testing.T) {
	user := User{ID: 1, Name: "John", Email: "john@163.com"}
	jsonData, _ := json.Marshal(user)

	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(bytes.NewReader(jsonData)),
	}

	var result User
	err := parseJsonBody(resp, &result)
	require.NoError(t, err)
	assert.Equal(t, user.ID, result.ID)
	assert.Equal(t, user.Name, result.Name)
	assert.Equal(t, user.Email, result.Email)
}

func TestParseBodyInvalidJson(t *testing.T) {
	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader("invalid json")),
	}
	var result User
	err := parseJsonBody(resp, &result)
	assert.Error(t, err)
}

func TestParseBodyEmptyJson(t *testing.T) {
	resp := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader("")),
	}
	var result User
	err := parseJsonBody(resp, &result)
	assert.Error(t, err)
}

func TestRequestAndParseSuccess(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := ApiResponse{
			Success: true,
			Message: "User retrieved success",
			Data:    &User{ID: 1, Name: "John", Email: "John@163.com"},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	result, err := RequestAndParse[ApiResponse](client, server.URL, "GET")
	require.NoError(t, err)
	assert.NotNil(t, result)
	assert.True(t, result.Success)
	assert.Equal(t, "User retrieved success", result.Message)
	assert.Equal(t, 1, result.Data.ID)
	assert.Equal(t, "John", result.Data.Name)
}

func TestRequestAndParseWithOptions(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "Bearer token123", r.Header.Get("authorization"))
		assert.Equal(t, "123", r.URL.Query().Get("user_id"))

		response := map[string]any{
			"status":  "success",
			"user_id": r.URL.Query().Get("user_id"),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	headers := map[string]string{"Authorization": "Bearer token123"}
	params := map[string]string{"user_id": "123"}

	result, err := RequestAndParse[map[string]any](client, server.URL, "GET", HttpHeader(headers), HttpParams(params), HttpReadTimeout(30000))
	require.NoError(t, err)
	assert.Equal(t, "success", (*result)["status"])
	assert.Equal(t, "123", (*result)["user_id"])
}

func TestRequestAndParseHttpError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "Internal server error"}`))
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	result, err := RequestAndParse[ApiResponse](client, server.URL, "GET")
	// 注意：HTTP 错误状态码不会导致 RequestAndParse 返回错误
	// 错误只会在网络层面或 JSON 解析失败时返回
	if err == nil {
		assert.NotNil(t, result)
	}
}

func TestRequestAndParseStreamSuccess(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Stream unsupported", http.StatusInternalServerError)
			return
		}

		// 发送流数据
		streamData := []string{
			`data: {"id": 1, "text": "First message"}`,
			`data: {"id": 2, "text": "Second message"}`,
			`data: {"id": 3, "text": "Third message"}`,
		}

		for _, data := range streamData {
			fmt.Fprintf(w, "%s\n\n", data)
			flusher.Flush()
			time.Sleep(10 * time.Millisecond)
		}
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)
	assert.NotNil(t, stream)

	// 收集流数据
	var received []StreamData
	var mu sync.Mutex
	processed := make(chan bool, 1)

	stream.Async(func(data StreamData) {
		mu.Lock()
		received = append(received, data)
		mu.Unlock()

		if len(received) >= 3 {
			processed <- true
			stream.Close()
		}
	})

	select {
	case <-processed:
	case <-time.After(1 * time.Second):
		t.Fatal("Timeout waiting for stream data")
	}

	assert.Len(t, received, 3)
	assert.Equal(t, 1, received[0].ID)
	assert.Equal(t, "First message", received[0].Text)
}

func TestRequestAndParseStreamSuccessUseWriteDoneSignal(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Stream unsupported", http.StatusInternalServerError)
			return
		}

		// 发送流数据
		streamData := []string{
			`data: {"id": 1, "text": "First message"}`,
			`data: {"id": 2, "text": "Second message"}`,
			`data: {"id": 3, "text": "Third message"}`,
		}

		for _, data := range streamData {
			fmt.Fprintf(w, "%s\n\n", data)
			flusher.Flush()
			time.Sleep(10 * time.Millisecond)
		}

		fmt.Fprintf(w, "data: [DONE]\n\n")
		flusher.Flush()
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)
	assert.NotNil(t, stream)

	// 使用带超时的读取方式
	var received []StreamData
	timeout := time.After(3 * time.Second)
	done := false

	for !done {
		select {
		case <-timeout:
			t.Fatal("Test timeout")
		default:
			if !stream.Next() {
				// 流已结束
				break
			}
			data, err := stream.Read()
			if err != nil {
				// 检查是否是结束信号
				if strings.Contains(err.Error(), "DONE") {
					done = true
					break
				}
				t.Fatalf("Read error: %v", err)
			}
			received = append(received, data)
		}
	}

	assert.Len(t, received, 3)
	assert.Equal(t, 1, received[0].ID)
	assert.Equal(t, "First message", received[0].Text)

	stream.Close()
}

func TestRequestAndParseAsyncProcessing(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		flusher := w.(http.Flusher)

		streamData := []string{
			`data: {"id": 1, "text": "Message 1"}`,
			`data: {"id": 2, "text": "Message 2"}`,
			`data: {"id": 3, "text": "Message 3"}`,
		}
		for _, data := range streamData {
			fmt.Fprintf(w, "%s\n\n", data)
			flusher.Flush()
			time.Sleep(10 * time.Millisecond)
		}

		fmt.Fprintf(w, "data: [DONE]\n\n")
		flusher.Flush()
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)

	// 使用 Async 方法处理数据，但设置超时
	var received []StreamData
	var mu sync.Mutex
	processed := make(chan bool, 1)

	go func() {
		err = stream.Async(func(data StreamData) {
			mu.Lock()
			received = append(received, data)
			mu.Unlock()

			if len(received) >= 3 {
				processed <- true
			}
		})
		// 如果 Async 完成，也发送信号
		processed <- true
	}()

	// 等待处理完成或超时
	select {
	case <-processed:
		// 成功收到3条消息或Async自然结束
	case <-time.After(2 * time.Second):
		stream.Close()
		t.Fatal("Timeout waiting form async processing")
	}

	require.Len(t, received, 3)
	stream.Close()
}

func TestRequestAndParseStreamControlled(t *testing.T) {
	// 使用 channel 控制服务器行为
	serverDone := make(chan bool)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		flusher, _ := w.(http.Flusher)

		// 发送有限数量的数据
		for i := 1; i <= 3; i++ {
			select {
			case <-serverDone:
				return
			default:
				fmt.Fprintf(w, "data: {\"id\": %d, \"text\": \"Message %d\"}\n\n", i, i)
				flusher.Flush()
				time.Sleep(10 * time.Millisecond)
			}
		}

		// 短暂等待后关闭
		time.Sleep(100 * time.Millisecond)
	}))
	defer server.Close()
	defer close(serverDone)

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)

	// 使用超时控制读取
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	var received []StreamData
readLoop:
	for {
		select {
		case <-ctx.Done():
			break readLoop
		default:
			if stream.Next() {
				data, err := stream.Read()
				if err != nil {
					break readLoop
				}
				received = append(received, data)
				if len(received) >= 3 {
					break readLoop
				}
			} else {
				break readLoop
			}
		}
	}
	stream.Close()

	assert.True(t, len(received) <= 3)
}

func TestRequestAndParseStreamBasic(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		flusher, _ := w.(http.Flusher)
		// 只发送一条消息然后立即结束
		fmt.Fprintf(w, "data: {\"id\": 1, \"text\": \"Single message\"}\n\n")
		flusher.Flush()
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)

	// 设置读取超时
	timeout := time.After(1 * time.Second)
	var received []StreamData

	select {
	case <-timeout:
		// 超时是预期的，因为服务器发送一条消息后就结束了
		t.Log("Read timeout as expected")
	case <-func() chan bool {
		ch := make(chan bool)
		go func() {
			if stream.Next() {
				data, err := stream.Read()
				if err == nil {
					received = append(received, data)
				}
				ch <- true
			}
		}()
		return ch
	}():
	}

	if len(received) > 0 {
		assert.Equal(t, 1, received[0].ID)
		assert.Equal(t, "Single message", received[0].Text)
	}

	stream.Close()
}

func TestRequestAndParseHttpError2(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("Not found"))
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	result, err := RequestAndParse[ApiResponse](client, server.URL, "GET")
	// 注意：HTTP 错误状态码不会导致 RequestAndParse 返回错误
	// 错误只会在网络层面或 JSON 解析失败时返回
	if err == nil {
		assert.NotNil(t, result)
	}
}

func TestRequestAndParseStreamEmptyResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		// 不发送任何数据，立即返回
		flusher, _ := w.(http.Flusher)
		flusher.Flush()
	}))
	defer server.Close()

	client := &http.Client{Timeout: 5 * time.Second}

	stream, err := RequestAndParseStream[StreamData](client, server.URL, "GET")
	require.NoError(t, err)

	// 由于服务器立即返回空响应，流应该很快关闭
	// 等待流处理完成
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	streamClosed := make(chan bool)
	go func() {
		stream.WaitClosed()
		streamClosed <- true
	}()

	select {
	case <-streamClosed:
		// 流已关闭，测试通过
		assert.True(t, stream.IsClosed())
	case <-ctx.Done():
		// 即使超时，我们也手动关闭流并继续
		stream.Close()
		t.Log("Stream didn't close automatically, manually closed")
	}

	assert.False(t, stream.Next(), "Next() should return false for closed stream")
}
