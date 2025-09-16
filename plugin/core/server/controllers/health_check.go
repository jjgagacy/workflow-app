package controllers

import (
	"sync/atomic"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
)

var (
	// How many requests are active
	activeRequests int32 = 0
	// How many plugin dispatching requests are active
	activeDispatchRequests int32 = 0
)

func CollectActiveRequests() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		atomic.AddInt32(&activeRequests, 1)
		ctx.Next()
		atomic.AddInt32(&activeRequests, -1)
	}
}

func CollectActiveDispatchRequests() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		atomic.AddInt32(&activeDispatchRequests, 1)
		ctx.Next()
		atomic.AddInt32(&activeDispatchRequests, -1)
	}
}

func HealthCheck(config *core.Config) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"status":                   "ok",
			"platform":                 config.Platform,
			"active_requests":          activeRequests,
			"active_dispatch_requests": activeDispatchRequests,
		})
	}
}
