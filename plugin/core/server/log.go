package server

import (
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/getsentry/sentry-go"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/local_sentry"
)

func (app *App) setupLogging(config *core.Config) {
	file, err := os.OpenFile(filepath.Join(config.LogingLocalPath, "app.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(err)
	}
	app.loggerFile = file

	multi := io.MultiWriter(os.Stderr, file)
	log.SetOutput(multi)
}

func (app *App) setupLocalSentry(config *core.Config) {
	l, err := local_sentry.NewLocalSentry(filepath.Join(config.LogingLocalPath, "local_errors.log"))

	if err != nil {
		log.Fatalf("local sentry err: %s", err.Error())
	}
	app.localSentry = l
	utils.LocalSentry = l
}

func (app *App) setupPool(config *core.Config) {
	if config.SentryEnabled {
		utils.InitPool(config.RoutinePoolSize, sentry.ClientOptions{
			Dsn:              config.SentryDSN,
			AttachStacktrace: config.SentryAttachStacktrace,
			TracesSampleRate: config.SentryTracesSampleRate,
			SampleRate:       config.SentrySampleRate,
			EnableTracing:    config.SentryTracingEnabled,
		})
	} else {
		utils.InitPool(config.RoutinePoolSize)
	}
}

func (app *App) closeLogging() {
	if app.localSentry != nil {
		app.localSentry.Close()
	}
	if app.loggerFile != nil {
		app.loggerFile.Close()
	}
}
