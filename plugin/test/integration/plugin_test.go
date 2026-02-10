package integration

import (
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHelloPluginEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// time.Sleep(30 * time.Second)

	// todo: plugin init and request

	// req, _ := http.NewRequest("GET", "/health/check", nil)
	// w := httptest.NewRecorder()

	// app.Engine.ServeHTTP(w, req)

	// if w.Code != http.StatusOK {
	// 	t.Fatal(w.Code)
	// }

	// t.Logf("status=%d, body=%s", w.Code, w.Body.String())
}
