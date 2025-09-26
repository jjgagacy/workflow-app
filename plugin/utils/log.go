package utils

import (
	"fmt"
	"log"
	"os"
)

var (
	showLog = true

	logger = log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
)

const (
	LOG_LEVEL_DEBUG_COLOR = "\033[34m"
	LOG_LEVEL_INFO_COLOR  = "\033[32m"
	LOG_LEVEL_WARN_COLOR  = "\033[33m"
	LOG_LEVEL_ERROR_COLOR = "\033[31m"
	LOG_LEVEL_COLOR_END   = "\033[0m"
)

func writeLog(level string, format string, stdout bool, v ...interface{}) {
	format = fmt.Sprintf("["+level+"]"+format, v...)

	if showLog && stdout {
		switch level {
		case "DEBUG":
			logger.Output(3, LOG_LEVEL_DEBUG_COLOR+format+LOG_LEVEL_COLOR_END)
		case "INFO":
			logger.Output(3, LOG_LEVEL_INFO_COLOR+format+LOG_LEVEL_COLOR_END)
		case "WARN":
			logger.Output(3, LOG_LEVEL_WARN_COLOR+format+LOG_LEVEL_COLOR_END)
		case "ERROR":
			logger.Output(3, LOG_LEVEL_ERROR_COLOR+format+LOG_LEVEL_COLOR_END)
		case "PANIC":
			logger.Output(3, LOG_LEVEL_ERROR_COLOR+format+LOG_LEVEL_COLOR_END)
			panic(format)
		}
	}
}

func SetLogVisibility(v bool) {
	showLog = v
}

func Debug(format string, v ...any) {
	writeLog("DEBUG", format, true, v...)
}

func Info(format string, v ...any) {
	writeLog("INFO", format, true, v...)
}

func Warn(format string, v ...any) {
	writeLog("WARN", format, true, v...)
}

func Error(format string, v ...any) {
	writeLog("ERROR", format, true, v...)
}

func Panic(format string, v ...any) {
	writeLog("PANIC", format, true, v...)
}
