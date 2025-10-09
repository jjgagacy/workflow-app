package http_requests

import (
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestServer(t *testing.T, handler http.HandlerFunc) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(handler))
}

func TestBuildHttpRequestBasic(t *testing.T) {
	req, err := buildHttpRequest("GET", "http://example.com")
	require.NoError(t, err)
	assert.Equal(t, "GET", req.Method)
	assert.Equal(t, "http://example.com", req.URL.String())
}

func TestBuildHttpRequestWithHeaders(t *testing.T) {
	headers := map[string]string{
		"Authorization": "Bearer token123",
		"User-Agent":    "TestClient",
	}

	req, err := buildHttpRequest("GET", "http://example.com", HttpHeader(headers))
	require.NoError(t, err)

	assert.Equal(t, "Bearer token123", req.Header.Get("Authorization"))
	assert.Equal(t, "TestClient", req.Header.Get("User-Agent"))
}

func TestBuildHttpRequestWithQueryParams(t *testing.T) {
	params := map[string]string{
		"page":  "1",
		"limit": "10",
		"query": "test search",
	}

	req, err := buildHttpRequest("GET", "http://example.com", HttpParams(params))
	require.NoError(t, err)

	assert.Contains(t, req.URL.RawQuery, "page=1")
	assert.Contains(t, req.URL.RawQuery, "limit=10")
	assert.Contains(t, req.URL.RawQuery, "query=test+search")
}

func TestBuildHttpRequestWithPayload(t *testing.T) {
	payload := map[string]string{
		"username": "testuser",
		"password": "testpass",
	}

	req, err := buildHttpRequest("POST", "http://example.com", HttpPayload(payload))
	require.NoError(t, err)

	body, err := io.ReadAll(req.Body)
	require.NoError(t, err)
	defer req.Body.Close()

	assert.Contains(t, string(body), "username=testuser")
	assert.Equal(t, int64(len(body)), req.ContentLength)
}

func TestBuildHttpRequestWithTextPayload(t *testing.T) {
	text := "Hello, this is plain text payload"

	req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadText(text))
	require.NoError(t, err)

	body, err := io.ReadAll(req.Body)
	require.NoError(t, err)
	defer req.Body.Close()

	assert.Equal(t, text, string(body))
	assert.Equal(t, "text/plain", req.Header.Get("Content-Type"))
}

func TestBuildHttpRequestWithJSONPayload(t *testing.T) {
	jsonData := map[string]any{
		"name":  "John Doe",
		"email": "john@example.com",
		"age":   30,
	}

	req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadJson(jsonData))
	require.NoError(t, err)

	body, err := io.ReadAll(req.Body)
	require.NoError(t, err)
	defer req.Body.Close()

	assert.Equal(t, "application/json", req.Header.Get("Content-Type"))

	var decoded map[string]any
	err = json.Unmarshal(body, &decoded)
	require.NoError(t, err)

	assert.Equal(t, "John Doe", decoded["name"])
	assert.Equal(t, "john@example.com", decoded["email"])
	assert.Equal(t, float64(30), decoded["age"]) // JSON numbers are float64
}

func TestBuildHttpRequestWithMultipartPayload(t *testing.T) {
	fileContent := "This is a test file content"
	files := map[string]HttpPayloadMultipartFile{
		"document": {
			Filename: "test.txt",
			Reader:   strings.NewReader(fileContent),
		},
	}

	payload := map[string]string{
		"title":       "Test Document",
		"description": "A test file upload",
	}

	req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadMultipart(payload, files))
	require.NoError(t, err)

	// 验证 Content-Type
	assert.Contains(t, req.Header.Get("Content-Type"), "multipart/form-data")
	// 解析 multipart 数据验证内容
	reader := multipart.NewReader(req.Body, strings.Split(req.Header.Get("Content-Type"), "boundary=")[1])

	form, err := reader.ReadForm(1024 * 1024)
	require.NoError(t, err)
	defer req.Body.Close()

	// 验证文件部分
	fileHeaders := form.File["document"]
	require.Len(t, fileHeaders, 1)
	assert.Equal(t, "test.txt", fileHeaders[0].Filename)

	file, err := fileHeaders[0].Open()
	require.NoError(t, err)

	fileData, err := io.ReadAll(file)
	require.NoError(t, err)
	assert.Equal(t, fileContent, string(fileData))

	// 验证表单字段
	assert.Equal(t, []string{"Test Document"}, form.Value["title"])
	assert.Equal(t, []string{"A test file upload"}, form.Value["description"])
}

func TestBuildHttpRequestWithReaderPayload(t *testing.T) {
	content := "Streamed content from reader"
	reader := io.NopCloser(strings.NewReader(content))

	req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadReader(reader))
	require.NoError(t, err)

	body, err := io.ReadAll(req.Body)
	require.NoError(t, err)
	defer req.Body.Close()

	assert.Equal(t, content, string(body))
}

func TestBuildHttpRequestWithDirectReferer(t *testing.T) {
	url := "http://example.com/api/test"
	req, err := buildHttpRequest("GET", url, HttpDirectReferer())
	require.NoError(t, err)
	assert.Equal(t, url, req.Header.Get("Referer"))
}

func TestBuildHttpRequestMultipleOption(t *testing.T) {
	headers := map[string]string{
		"X-API-Key": "secret-key",
	}
	params := map[string]string{
		"debug": "true",
	}
	jsonData := map[string]string{
		"action": "test",
	}

	req, err := buildHttpRequest("POST", "http://example.com/api", HttpHeader(headers), HttpParams(params), HttpPayloadJson(jsonData))
	require.NoError(t, err)

	// 验证头部
	assert.Equal(t, "secret-key", req.Header.Get("X-API-KEY"))
	assert.Equal(t, "application/json", req.Header.Get("Content-Type"))

	// 验证查询参数
	assert.Contains(t, req.URL.RawQuery, "debug=true")

	// 验证 JSON 体
	body, err := io.ReadAll(req.Body)
	require.NoError(t, err)
	defer req.Body.Close()

	var decoded map[string]string
	err = json.Unmarshal(body, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "test", decoded["action"])
}

type errReader struct {
}

func (e *errReader) Read(p []byte) (n int, err error) {
	return 0, io.ErrUnexpectedEOF
}

func TestBuildHttpRequestErrorCases(t *testing.T) {
	t.Run("InvalidURL", func(t *testing.T) {
		req, err := buildHttpRequest("GET", "://invalid-url")
		assert.Error(t, err)
		assert.Nil(t, req)
	})

	t.Run("InvalidJSONPaylod", func(t *testing.T) {
		// 创建一个无法被 JSON 序列化的值（循环引用）
		type Circular struct {
			Self *Circular
		}
		circular := &Circular{}
		circular.Self = circular

		req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadJson(circular))
		assert.Error(t, err)
		assert.Nil(t, req)
	})

	t.Run("MultipartCreateFileError", func(t *testing.T) {
		files := map[string]HttpPayloadMultipartFile{
			"file": {
				Filename: "test.txt",
				Reader:   &errReader{},
			},
		}
		payload := map[string]string{"field": "value"}

		req, err := buildHttpRequest("POST", "http://example.com", HttpPayloadMultipart(payload, files))
		assert.Error(t, err)
		assert.Nil(t, req)
	})
}

func TestRequestIntegration(t *testing.T) {
	server := createTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		// 验证请求方法
		assert.Equal(t, "POST", r.Method)
		// 验证头部
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))
		assert.Equal(t, "test-client", r.Header.Get("User-Agent"))
		// 验证查询参数
		assert.Equal(t, "123", r.URL.Query().Get("id"))
		// 读取并验证请求体
		body, err := io.ReadAll(r.Body)
		require.NoError(t, err)

		var data map[string]string
		err = json.Unmarshal(body, &data)
		require.NoError(t, err)
		assert.Equal(t, "test data", data["message"])

		// 返回响应
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	})

	defer server.Close()

	client := &http.Client{}
	headers := map[string]string{
		"User-Agent": "test-client",
	}
	params := map[string]string{
		"id": "123",
	}
	jsonData := map[string]string{
		"message": "test data",
	}
	resp, err := Request(client, server.URL, "POST", HttpHeader(headers), HttpParams(params), HttpPayloadJson(jsonData))
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var m map[string]string
	err = json.NewDecoder(resp.Body).Decode(&m)
	require.NoError(t, err)
	assert.Equal(t, "success", m["status"])
}

func TestRequestNetworkError(t *testing.T) {
	client := &http.Client{
		Timeout: 1, // 1纳秒，确保超时
	}

	// 使用一个不会响应的地址
	resp, err := Request(client, "http://192.0.2.1:9999", "GET")
	assert.Error(t, err)
	assert.Nil(t, resp)
}
