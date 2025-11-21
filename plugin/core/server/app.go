package server

import (
	"os"

	"github.com/jjgagacy/workflow-app/plugin/utils/local_sentry"
)

type App struct {
	// Customize behavior of EndPoint handler
	endPointHandler EndPointHandler

	ls     *local_sentry.LocalSentry
	logger *os.File
}
