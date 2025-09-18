package service

import (
	"bufio"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCopyRequest(t *testing.T) {
	tests := []struct {
		name         string
		setupRequest func() *http.Request
		hookId       string
		path         string
		wantHookId   string
		wantMethod   string
		wantPath     string
		wantBody     string
		checkHeaders func(t *testing.T, req *http.Request)
		expectError  bool
	}{
		{
			name: "Basic GET request",
			setupRequest: func() *http.Request {
				body := strings.NewReader("test body content")
				req := httptest.NewRequest("POST", "http://example.com/api/v1/test?foo=bar", body)
				req.Header.Set("Content-Type", "application/json")
				req.Header.Set("X-Forwarded-For", "192.168.1.1")
				return req
			},
			hookId:     "test-hook",
			path:       "/new/path",
			wantHookId: "test-hook",
			wantMethod: "POST",
			wantPath:   "/new/path",
			checkHeaders: func(t *testing.T, req *http.Request) {
				if req.Header.Get("X-Hook-ID") != "test-hook" {
					t.Errorf("Expected X-Hook-ID header to be 'test-hook', got '%s'", req.Header.Get("X-Hook-ID"))
				}
				if req.Header.Get("X-Original-Method") != "POST" {
					t.Errorf("Expected X-Original-Method header to be 'POST', got '%s'", req.Header.Get("X-Original-Method"))
				}
				if req.Header.Get("Content-Type") != "application/json" {
					t.Errorf("Expected Content-Type header to be 'application/json', got '%s'", req.Header.Get("Content-Type"))
				}
				if req.Header.Get("X-Forwarded-For") != "" {
					t.Errorf("Expected X-Forwarded-For header to be removed, got '%s'", req.Header.Get("X-Forwarded-For"))
				}
			},
			wantBody:    "test body content",
			expectError: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.setupRequest()
			gotBuffer, err := copyRequest(req, tt.hookId, tt.path)
			if (err != nil) != tt.expectError {
				t.Errorf("copyRequest() error = %v, expectError %v", err, tt.expectError)
				return
			}
			if err != nil {
				return
			}
			gotReq, err := http.ReadRequest(bufio.NewReader(gotBuffer))
			if err != nil {
				t.Fatalf("Failed to read request from buffer: %v", err)
			}
			if gotReq.URL.Path != tt.wantPath {
				t.Errorf("Expected path %s, got %s", tt.wantPath, gotReq.URL.Path)
			}
			if gotReq.Method != tt.wantMethod {
				t.Errorf("Expected method %s, got %s", tt.wantMethod, gotReq.Method)
			}
			if gotReq.Header.Get("X-Hook-ID") != tt.wantHookId {
				t.Errorf("Expected X-Hook-ID %s, got %s", tt.wantHookId, gotReq.Header.Get("X-Hook-ID"))
			}
			bodyBytes := make([]byte, len(tt.wantBody))
			gotReq.Body.Read(bodyBytes)
			if string(bodyBytes) != tt.wantBody {
				t.Errorf("Expected body %s, got %s", tt.wantBody, string(bodyBytes))
			}
			if tt.checkHeaders != nil {
				tt.checkHeaders(t, gotReq)
			}
		})
	}
}
