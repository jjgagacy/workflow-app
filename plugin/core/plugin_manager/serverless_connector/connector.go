package serverless_connector

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"

	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
	"github.com/jjgagacy/workflow-app/plugin/utils/http_requests"
	"github.com/jjgagacy/workflow-app/plugin/utils/parser"
)

var (
	ErrFunctionNotFound = errors.New("no function found")
)

type LaunchFunctionEvent string

const (
	Error       LaunchFunctionEvent = "error"
	Info        LaunchFunctionEvent = "info"
	Function    LaunchFunctionEvent = "function"
	FunctionURL LaunchFunctionEvent = "function_url"
	Done        LaunchFunctionEvent = "done"
)

type LaunchFunctionResponse struct {
	Event   LaunchFunctionEvent `json:"event"`
	Message string              `json:"message"`
}

type ServerlessFunction struct {
	FunctionName string `json:"function_name" validate:"required"`
	FunctionURL  string `json:"function_url" validate:"required"`
	FunctionDRN  string `json:"function_drn" validate:"required"`
}

// Setup the function from serverless connector, it will receive the context as the input
// and build it a docker image, then run it on serverless platform like AWS Lambda or Google Cloud Functions.
// it returns a event stream, the caller should consider it as a async operation.
func SetupFunction(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
	manifest plugin_entities.PluginDeclaration,
	checksum string,
	context io.Reader,
	timeout int, // in seconds
) (*utils.Stream[LaunchFunctionResponse], error) {
	url, err := url.JoinPath(baseURL.String(), "/v1/launch")
	if err != nil {
		return nil, err
	}

	metadata, err := json.Marshal(map[string]string{
		"plugin_unique_identifier": pluginUniqueIdentifier.String(),
	})
	if err != nil {
		return nil, err
	}

	// join a filename
	serverless_connector_response, err := http_requests.RequestAndParseStream[LaunchFunctionResponseChunk](
		client,
		url,
		"POST",
		http_requests.HttpHeader(map[string]string{
			"Authorization": "Bearer " + SERVERLESS_CONNECTOR_API_KEY,
		}),
		http_requests.HttpReadTimeout(int64(timeout)*1000),
		http_requests.HttpWriteTimeout(int64(timeout)*1000),
		http_requests.HttpPayloadMultipart(
			map[string]string{
				"verified": func() string {
					if manifest.Verified {
						return "true"
					}
					return "false"
				}(),
				"metadata": string(metadata),
			},
			map[string]http_requests.HttpPayloadMultipartFile{
				"context": {
					Filename: getFunctionFilename(manifest, checksum),
					Reader:   context,
				},
			},
		),
	)
	if err != nil {
		return nil, err
	}

	response := utils.NewStream[LaunchFunctionResponse](10)

	utils.Submit(map[string]string{
		"module": "serverless_connector",
		"func":   "SetupFunction",
	}, func() {
		defer response.Close()
		if err := serverless_connector_response.Async(func(chunk LaunchFunctionResponseChunk) {
			if chunk.State == LAUNCH_STATE_FAILED {
				response.Write(LaunchFunctionResponse{
					Event:   Error,
					Message: chunk.Message,
				})
				return
			}
			switch chunk.Stage {
			case LAUNCH_STAGE_START, LAUNCH_STAGE_BUILD:
				response.Write(LaunchFunctionResponse{
					Event:   Info,
					Message: "building plugin...",
				})
			case LAUNCH_STAGE_RUN:
				if chunk.State == LAUNCH_STATE_SUCCESS {
					data, err := parser.ParserCommaSeparatedValues[LaunchFunctionFinalStageMessage]([]byte(chunk.Message))
					if err != nil {
						response.Write(LaunchFunctionResponse{
							Event:   Error,
							Message: err.Error(),
						})
						return
					}
					response.Write(LaunchFunctionResponse{
						Event:   Function,
						Message: data.Name,
					})
					response.Write(LaunchFunctionResponse{
						Event:   FunctionURL,
						Message: data.Endpoint,
					})
				} else {
					response.Write(LaunchFunctionResponse{
						Event:   Info,
						Message: "launching plugin...",
					})
				}
			case LAUNCH_STAGE_END:
				response.Write(LaunchFunctionResponse{
					Event:   Done,
					Message: "plugin launched",
				})
			}
		}); err != nil {
			response.Write(LaunchFunctionResponse{
				Event:   Error,
				Message: err.Error(),
			})
		}
	})

	return response, nil
}

// Fetch the function from the serverless connector
// returns error if failed
func FetchFunction(manifest plugin_entities.PluginDeclaration, checksum string) (*ServerlessFunction, error) {
	filename := getFunctionFilename(manifest, checksum)

	url, err := url.JoinPath(baseURL.String(), "/v1/runner/instances")
	if err != nil {
		return nil, err
	}

	response, err := http_requests.RequestAndParse[RunnerInstances](
		client,
		url,
		"GET",
		http_requests.HttpHeader(map[string]string{
			"Authorization": "Bearer " + SERVERLESS_CONNECTOR_API_KEY,
		}),
		http_requests.HttpParams(map[string]string{
			"filename": filename,
		}),
	)
	if err != nil {
		return nil, err
	}

	if response.Error != "" {
		return nil, fmt.Errorf("unexpected response from plugin controller: %s", response.Error)
	}

	if len(response.Items) == 0 {
		return nil, ErrFunctionNotFound
	}

	return &ServerlessFunction{
		FunctionName: response.Items[0].Name,
		FunctionURL:  response.Items[0].Endpoint,
		FunctionDRN:  response.Items[0].ResourceName,
	}, nil
}
