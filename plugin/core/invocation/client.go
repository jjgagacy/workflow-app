package invocation

import (
	"net"
	"net/http"
	"net/url"
	"time"
)

type InvocationDaemonPayload struct {
	BaseUrl      string
	ApiKey       string
	WriteTimeout int64
	ReadTimeout  int64
}

func NewInvocationDaemon(payload InvocationDaemonPayload) (BackwardsInvocation, error) {
	var err error
	invocation := &RequestBackwardsInvocation{}
	baseUrl, err := url.Parse(payload.BaseUrl)
	if err != nil {
		return nil, err
	}

	client := &http.Client{
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   3 * time.Second,
				KeepAlive: 60 * time.Second,
			}).DialContext,
			MaxIdleConns:        200,
			MaxIdleConnsPerHost: 50,
			MaxConnsPerHost:     100,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 5 * time.Second,
		},
		Timeout: 15 * time.Second,
	}

	invocation.ApiBaseUrl = baseUrl
	invocation.client = client
	invocation.ApiKey = payload.ApiKey
	invocation.writeTimeout = payload.WriteTimeout
	invocation.readTimeout = payload.ReadTimeout

	return invocation, nil
}
