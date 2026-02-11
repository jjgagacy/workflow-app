package integration

import (
	"io"
	"net/http"
	"testing"
)

func TestHealthCheckEndpoint(t *testing.T) {
	resp, err := http.Get(baseUrl + "/health/check")
	if err != nil {
		t.Fatal(err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("status=%d body=%s", resp.StatusCode, body)
	}
}
