package serverless_connector

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
)

type RunnerInstance struct {
	ID           string `json:"id" validate:"required"`
	Name         string `json:"name" validate:"required"`
	Endpoint     string `json:"endpoint" validate:"required"`
	ResourceName string `json:"resource_name" validate:"required"`
	Status       struct {
		State string `json:"state" validate:"required"`
	} `json:"status" validate:"required"`
}

type RunnerInstances struct {
	Error string           `json:"error"`
	Items []RunnerInstance `json:"items"`
}

type LaunchStage string

const (
	LAUNCH_STAGE_START LaunchStage = "start"
	LAUNCH_STAGE_BUILD LaunchStage = "build"
	LAUNCH_STAGE_RUN   LaunchStage = "run"
	LAUNCH_STAGE_END   LaunchStage = "end"
)

type LaunchState string

const (
	LAUNCH_STATE_PENDING LaunchState = "pending"
	LAUNCH_STATE_RUNNING LaunchState = "running"
	LAUNCH_STATE_SUCCESS LaunchState = "success"
	LAUNCH_STATE_FAILED  LaunchState = "failed"
)

type LaunchFunctionResponseChunk struct {
	Stage   LaunchStage `json:"stage" validate:"required"`
	State   LaunchState `json:"state" validate:"required"`
	Obj     string      `json:"obj" validate:"required"`
	Message string      `json:"message" validate:"required"`
}

type LaunchFunctionFinalStageMessage struct {
	Endpoint string `comma:"endpoint"`
	Name     string `comma:"name"`
	ID       string `comma:"id"`
}

func getFunctionFilename(manifest plugin_entities.PluginDeclaration, checksum string) string {
	return fmt.Sprintf("%s@%s@%s@%s.moniepkg", manifest.Author, manifest.Name, manifest.Version, checksum)
}
