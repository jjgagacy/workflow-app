package serverless_connector

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/http_requests"
)

var (
	SERVERLESS_CONNECTOR_API_KEY string
	baseURL                      *url.URL
	client                       *http.Client
)

func Init(config *core.Config) {
	var err error
	baseURL, err = url.Parse(*config.PluginServerlessConnectorURL)
	if err != nil {
		utils.Panic("failed to parse connector url: %v", err)
	}

	// 创建底层的 Dialer
	dialer := &net.Dialer{
		Timeout:   5 * time.Second,   // TCP 连接建立超时时间
		KeepAlive: 120 * time.Second, // TCP Keep-Alive 探测间隔
	}

	// 创建 HTTP 客户端
	client = &http.Client{
		Transport: &http.Transport{
			DialContext:       dialer.DialContext,
			IdleConnTimeout:   120 * time.Second, // 空闲连接保持活跃的时间
			Proxy:             http.ProxyFromEnvironment,
			ForceAttemptHTTP2: true,
		},
	}

	SERVERLESS_CONNECTOR_API_KEY = *config.PluginServerlessConnectorAPIKey

	if err := Ping(); err != nil {
		utils.Panic("failed to ping serverless connector: %v", err)
	}
}

func Ping() error {
	url, err := url.JoinPath(baseURL.String() + "/ping")
	if err != nil {
		return err
	}
	response, err := http_requests.RequestAndParse[string](
		client,
		url,
		"POST",
		http_requests.HttpHeader(map[string]string{
			"Authorization": "Bearer " + SERVERLESS_CONNECTOR_API_KEY,
		}),
	)
	if err != nil {
		return err
	}
	if response == nil || *response != "pong" {
		return fmt.Errorf("unexpected response from serverless connector: %s", *response)
	}
	return nil
}
