package integration

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/server"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

var (
	baseUrl  string
	shutdown func()
)

func loadTestConfig() *core.Config {
	_ = godotenv.Load("./testdata/.env.test")

	var cfg core.Config
	envconfig.Process("", &cfg)
	cfg.SetDefault()

	if err := cfg.Validate(); err != nil {
		panic(err)
	}

	return &cfg
}

func StartForTest(config *core.Config) (baseUrl string, shutdown func()) {
	app := &server.App{}

	app.Init(config)

	engine := app.BuildEngine(config)

	srv := &http.Server{
		Addr:    "127.0.0.1:0", // 0: random port
		Handler: engine,
	}

	ln, err := net.Listen("tcp", srv.Addr)
	if err != nil {
		panic(err)
	}

	go srv.Serve(ln)

	shutdown = func() {
		_ = srv.Shutdown(context.Background())
	}

	return "http://" + ln.Addr().String(), shutdown
}

// go test ./test/integration -v
func TestMain(m *testing.M) {
	fmt.Println("=== 测试开始 ===")
	config := loadTestConfig()

	baseUrl, shutdown = StartForTest(config)

	code := m.Run()

	time.Sleep(30 * time.Second)

	shutdown()
	fmt.Println("=== 测试结束 ===")
	os.Exit(code)
}
