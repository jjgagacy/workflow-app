package utils

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"slices"
)

var (
	showLog = false

	logger         = log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
	colorSupported = detectColorSupport()
)

const (
	LOG_LEVEL_DEBUG_COLOR = "\033[34m"
	LOG_LEVEL_INFO_COLOR  = "\033[32m"
	LOG_LEVEL_WARN_COLOR  = "\033[33m"
	LOG_LEVEL_ERROR_COLOR = "\033[31m"
	LOG_LEVEL_COLOR_END   = "\033[0m"

	LOG_LEVEL_DEBUG = "DEBUG"
	LOG_LEVEL_INFO  = "INFO"
	LOG_LEVEL_WARN  = "WARN"
	LOG_LEVEL_ERROR = "ERROR"
	LOG_LEVEL_PANIC = "PANIC"
)

func writeLog(level string, format string, stdout bool, v ...any) {
	message := fmt.Sprintf(format, v...)
	logMessage := "[" + level + "] " + message

	if showLog && stdout {
		if colorSupported {
			switch level {
			case LOG_LEVEL_DEBUG:
				logger.Output(3, LOG_LEVEL_DEBUG_COLOR+logMessage+LOG_LEVEL_COLOR_END)
			case LOG_LEVEL_INFO:
				logger.Output(3, LOG_LEVEL_INFO_COLOR+logMessage+LOG_LEVEL_COLOR_END)
			case LOG_LEVEL_WARN:
				logger.Output(3, LOG_LEVEL_WARN_COLOR+logMessage+LOG_LEVEL_COLOR_END)
			case LOG_LEVEL_ERROR:
				logger.Output(3, LOG_LEVEL_ERROR_COLOR+logMessage+LOG_LEVEL_COLOR_END)
			case LOG_LEVEL_PANIC:
				logger.Output(3, LOG_LEVEL_ERROR_COLOR+logMessage+LOG_LEVEL_COLOR_END)
			}
		} else {
			logger.Output(3, logMessage)
		}

		if level == LOG_LEVEL_PANIC {
			panic(logMessage)
		}
	}
}

func SetLogVisibility(v bool) {
	showLog = v
}

func Debug(format string, v ...any) {
	writeLog(LOG_LEVEL_DEBUG, format, true, v...)
}

func Info(format string, v ...any) {
	writeLog(LOG_LEVEL_INFO, format, true, v...)
}

func Warn(format string, v ...any) {
	writeLog(LOG_LEVEL_WARN, format, true, v...)
}

func Error(format string, v ...any) {
	writeLog(LOG_LEVEL_ERROR, format, true, v...)
}

func Panic(format string, v ...any) {
	writeLog(LOG_LEVEL_PANIC, format, true, v...)
}

// 检测终端是否支持颜色
func detectColorSupport() bool {
	// 检查环境变量
	if noColor := os.Getenv("NO_COLOR"); noColor != "" {
		return false
	}
	// 检查 TERM 环境变量
	term := os.Getenv("TERM")
	if term == "dumb" {
		return false
	}
	// 检查 COLORTERM 环境变量
	if os.Getenv("COLORTERM") != "" {
		return true
	}

	// 检查常见的支持颜色的终端类型
	supportedTerms := []string{"xterm", "xterm-256color", "screen", "screen-256color", "tmux", "tmux-256color"}
	if slices.Contains(supportedTerms, term) {
		return true
	}

	// Windows 检测
	if runtime.GOOS == "windows" {
		// 检查是否在支持颜色的终端中运行
		if os.Getenv("WT_SESSION") != "" { // Windows Terminal
			return true
		}
		if os.Getenv("ConEmuANSI") == "ON" { // ConEmu
			return true
		}
	}

	return false
}
