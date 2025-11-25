package run

import (
	"fmt"
	"log"
	"os"

	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	logger = log.New(os.Stdout, "", log.Ldate|log.Ltime|log.Lshortfile)
)

func runLog(response GenericResponse, responseFormat string) {
	switch responseFormat {
	case "json":
		jsonBytes := utils.MarshalJsonBytes(response)
		fmt.Println(string(jsonBytes))
	case "text":
		switch response.Type {
		case GENERIC_RESPONSE_TYPE_INFO:
			logger.Output(3, utils.LOG_LEVEL_DEBUG_COLOR+"[INFO]"+response.Response["info"].(string)+utils.LOG_LEVEL_COLOR_END)
		case GENERIC_RESPONSE_TYPE_ERROR:
			logger.Output(3, utils.LOG_LEVEL_ERROR_COLOR+"[ERROR]"+response.Response["error"].(string)+utils.LOG_LEVEL_COLOR_END)
		}
	}
}
