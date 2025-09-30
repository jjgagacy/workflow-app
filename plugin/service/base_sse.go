package service

import (
	"errors"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

func baseSSEService[R any](
	fn func() (*utils.Stream[R], error),
	ctx *gin.Context,
	maxTimeout int, // seconds
) {
	writer := ctx.Writer
	writer.WriteHeader(200)
	writer.Header().Set("Content-Type", "text/event-stream")

	done := make(chan bool)
	doneClosed := new(int32)
	closed := new(int32)

	writeData := func(data interface{}) {
		if atomic.LoadInt32(closed) == 1 {
			return
		}
		writer.Write([]byte("data: "))
		writer.Write(utils.MarshalJsonBytes(data))
		writer.Write([]byte("\n\n"))
		writer.Flush()
	}

	ch, err := fn()

	if err != nil {
		writeData(entities.InternalError(err).ToResponse())
		close(done)
		return
	}

	utils.Submit(map[string]string{
		"module":   "service",
		"function": "baseSseService",
	}, func() {
		for ch.Next() {
			chunk, err := ch.Read()
			if err != nil {
				writeData(entities.InvokePluginError(err).ToResponse())
				break
			}
			writeData(entities.NewSuccessResponse(chunk))
		}

		if atomic.CompareAndSwapInt32(doneClosed, 0, 1) {
			close(done)
		}
	})

	timer := time.NewTimer(time.Duration(maxTimeout) * time.Second)
	defer timer.Stop()

	defer func() {
		atomic.StoreInt32(closed, 1)
	}()

	select {
	case <-writer.CloseNotify():
		ch.Close()
		return
	case <-done:
		return
	case <-timer.C:
		writeData(entities.InternalError(errors.New("killed by timeout")).ToResponse())
		if atomic.CompareAndSwapInt32(doneClosed, 0, 1) {
			close(done)
		}
		return
	}
}

func baseSSEWithSession[T any, R any](
	fn func(*session_manager.Session) (*utils.Stream[R], error),
	accessType access_types.PluginAccessType,
	accessAction access_types.PluginAccessAction,
	request *plugin_entities.InvokePluginRequest[T],
	ctx *gin.Context,
	maxTimeout int,
) {
	session, err := createSession(
		request,
		accessType,
		accessAction,
	)
	if err != nil {
		ctx.JSON(500, entities.InternalError(err).ToResponse())
		return
	}
	defer session.Close(session_manager.CloseSessionPayload{
		IgnoreCache: false,
	})

	baseSSEService(
		func() (*utils.Stream[R], error) {
			return fn(session)
		},
		ctx,
		maxTimeout,
	)
}
