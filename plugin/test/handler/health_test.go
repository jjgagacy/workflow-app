package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/server"
	"github.com/jjgagacy/workflow-app/plugin/test"
)

func TestHello(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cfg := test.DefaultTestConfig()
	app := &server.App{}
	shutdowns, err := app.Init(cfg)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		for _, s := range shutdowns {
			s()
		}
	}()

	app.BuildEngine(cfg)

	req, _ := http.NewRequest("GET", "/health/check", nil)
	w := httptest.NewRecorder()

	app.Engine.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatal(w.Code)
	}

	t.Logf("status=%d, body=%s", w.Code, w.Body.String())
}
