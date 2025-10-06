package service

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/stretchr/testify/assert"
)

func init() {
	utils.InitPool(10)
}

// 使用一个包装器来提供 CloseNotify 方法
type closeNotifyRecorder struct {
	*httptest.ResponseRecorder
	closeChan chan bool
}

func (c *closeNotifyRecorder) CloseNotify() <-chan bool {
	return c.closeChan
}

func TestSSEServiceNormalFlow(t *testing.T) {
	gin.SetMode(gin.TestMode)

	testData := []string{"message1", "message2", "message3"}

	router := gin.New()
	router.GET("/sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				go func() {
					for _, data := range testData {
						stream.Write(data)
						time.Sleep(10 * time.Millisecond)
					}
					stream.Close()
				}()
				return stream, nil
			},
			ctx,
			5,
		)
	})

	// 创建测试请求
	req := httptest.NewRequest("GET", "/sse", nil)

	w := httptest.NewRecorder()

	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}

	// 执行请求
	router.ServeHTTP(wrapper, req)

	// 验证响应
	assert.Equal(t, 200, w.Code)
	body := w.Body.String()
	assert.Contains(t, body, "data: ")
	assert.Contains(t, body, "message1")
	assert.Contains(t, body, "message2")
	assert.Contains(t, body, "message3")
}

func TestSSEServiceEmptyStream(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				stream.Close()
				return stream, nil
			},
			ctx,
			5,
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}
	router.ServeHTTP(wrapper, req)
	assert.Equal(t, 200, w.Code)
}

func TestSSEStreamError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("/sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				return nil, errors.New("stream creation failed")
			},
			ctx,
			5,
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}
	router.ServeHTTP(wrapper, req)
	assert.Equal(t, 200, w.Code)
	body := w.Body.String()
	assert.Contains(t, body, "data: ")
	assert.Contains(t, body, "stream creation failed")
	assert.Contains(t, body, "ErrMsgInternal")
}

func TestSSEStreamReadError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("/sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				stream.Write("message1")
				stream.WriteError(errors.New("read error occurred"))
				return stream, nil
			},
			ctx,
			5,
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}
	router.ServeHTTP(wrapper, req)
	assert.Equal(t, 200, w.Code)
	body := w.Body.String()
	// t.Log("print body:")
	// t.Log(body)
	assert.Contains(t, body, "data: ")
	assert.Contains(t, body, "message1")
	assert.Contains(t, body, "read error occurred")
	assert.Contains(t, body, "ErrInvokePlugin")
}

func TestSSEStreamFilterError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("/sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				stream.Filter(func(data string) error {
					if data == "error_trigger" {
						return errors.New("filter error")
					}
					return nil
				})
				go func() {
					stream.Write("normal message")
					stream.Write("error_trigger")
					stream.Close()
				}()
				return stream, nil
			},
			ctx,
			5,
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}
	router.ServeHTTP(wrapper, req)
	assert.Equal(t, 200, w.Code)
	body := w.Body.String()
	// t.Log("print body:")
	// t.Log(body)
	assert.Contains(t, body, "data: ")
	assert.Contains(t, body, "normal message")
	assert.Contains(t, body, "filter error")
	// 第三个消息不应该出现，因为流在过滤器错误时关闭了
}

func TestSSEServiceTimeout(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.GET("/sse", func(ctx *gin.Context) {
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				go func() {
					for range 10 {
						stream.Write("message")
						time.Sleep(500 * time.Millisecond)
					}
					stream.Close()
				}()
				return stream, nil
			},
			ctx,
			1,
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}

	start := time.Now()
	router.ServeHTTP(wrapper, req)
	duration := time.Since(start)

	assert.Less(t, duration, 2*time.Second)
	assert.Equal(t, 200, w.Code)
	body := w.Body.String()
	assert.Contains(t, body, "killed by timeout")
}

type cancelableResponseWriter struct {
	gin.ResponseWriter
	ctx context.Context
}

func (w *cancelableResponseWriter) CloseNotify() <-chan bool {
	ch := make(chan bool, 1)
	go func() {
		<-w.ctx.Done() // 执行cancel后返回
		ch <- true
	}()
	return ch
}

func TestSSEStreamClientDisconnect(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctx, cancel := context.WithCancel(context.Background())

	router := gin.New()
	router.GET("/sse", func(c *gin.Context) {
		// 替换 gin.Context 的 Writer 为可取消的
		c.Writer = &cancelableResponseWriter{
			ResponseWriter: c.Writer,
			ctx:            ctx,
		}
		baseSSEService(
			func() (*utils.Stream[string], error) {
				stream := utils.NewStream[string](10)
				go func() {
					for range 5 {
						stream.Write("message")
						time.Sleep(100 * time.Millisecond)
					}
				}()
				return stream, nil
			},
			c,
			10, // long time
		)
	})
	req := httptest.NewRequest("GET", "/sse", nil)
	w := httptest.NewRecorder()
	wrapper := &closeNotifyRecorder{
		ResponseRecorder: w,
		closeChan:        make(chan bool, 1),
	}

	done := make(chan bool)
	go func() {
		router.ServeHTTP(wrapper, req)
		done <- true
	}()

	// 模拟客户端断开连接
	time.Sleep(300 * time.Millisecond)
	cancel()

	select {
	case <-done:
		// 正常结束
	case <-time.After(1 * time.Second):
		t.Error("服务没有在客户端断开后及时结束")
	}
}
