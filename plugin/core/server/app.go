package server

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/utils/local_sentry"
)

type App struct {
	Engine *gin.Engine
	server *http.Server

	// Customize behavior of EndPoint handler
	endPointHandler EndPointHandler

	ls     *local_sentry.LocalSentry
	logger *os.File
}
