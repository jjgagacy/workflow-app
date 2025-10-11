package backwards_invocation

import (
	"fmt"

	"github.com/jjgagacy/workflow-app/plugin/core/invocation"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_daemon/access_types"
	"github.com/jjgagacy/workflow-app/plugin/core/session_manager"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/utils"
)

var (
	dispatchMapping = map[invocation.InvokeType]func(handle *BackwardsInvocation){
		invocation.INVOKE_TYPE_TOOL: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationToolTask)
		},
		invocation.INVOKE_TYPE_LLM: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationLLMTask)
		},
		invocation.INVOKE_TYPE_TEXT_EMBEDDING: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationTextEmbeddingTask)
		},
		invocation.INVOKE_TYPE_RERANK: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationRerankTask)
		},
		invocation.INVOKE_TYPE_TTS: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationTTSTask)
		},
		invocation.INVOKE_TYPE_SPEECH2TEXT: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationSpeech2TextTask)
		},
		invocation.INVOKE_TYPE_MODERATION: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationModerationTask)
		},
		invocation.INVOKE_TYPE_APP: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationAppTask)
		},
		invocation.INVOKE_TYPE_STORAGE: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationStorageTask)
		},
		invocation.INVOKE_TYPE_UPLOAD_FILE: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationUploadFileTask)
		},
		invocation.INVOKE_TYPE_FETCH_APP: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationFetchAppTask)
		},
		invocation.INVOKE_TYPE_LLM_STRUCTURED_OUTPUT: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationLLMStructuredOutputTask)
		},
	}
)

func Invoke(
	declaration *plugin_entities.PluginDeclaration,
	accessType access_types.PluginAccessType,
	session *session_manager.Session,
	writer BackwardsInvocationWriter,
	data []byte,
) error {
	// Unmarshal invoke data from plugin returned
	request, err := utils.UnmarshalJsonBytesToMap(data)
	if err != nil {
		return fmt.Errorf("unmarshal invoke request failed: %s", err.Error())
	}
	if request == nil {
		return fmt.Errorf("invoke request is empty")
	}

	// prepare invocation arguments
	requestHandle, err := prepareInvocationArgs(
		session,
		writer,
		request,
	)
	if err != nil {
		return err
	}

	if accessType == access_types.PLUGIN_ACCESS_TYPE_MODEL {
		requestHandle.WriteError(fmt.Errorf("your can not invoke from %s", accessType))
		requestHandle.EndResponse()
		return nil
	}

	// check permission

	// dispatch invocation task
	utils.Submit(map[string]string{
		"module":   "plugin_daemon",
		"function": "Invoke",
	}, func() {
		dispatchInvocationTask(requestHandle)
		defer requestHandle.EndResponse()
	})

	return nil
}

func prepareInvocationArgs(
	session *session_manager.Session,
	writer BackwardsInvocationWriter,
	request map[string]any,
) (*BackwardsInvocation, error) {
	typ, ok := request["type"].(string)
	if !ok {
		return nil, fmt.Errorf("invoke request missing type: %s", request)
	}

	backwardsRequestId, ok := request["backwards_request_id"].(string)
	if !ok {
		return nil, fmt.Errorf("invoke request missing request id: %s", request)
	}

	detailedRequest, ok := request["request"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invoke request missint request: %s", request)
	}

	return NewBackwardsInvocation(
		BackwardsInvocationType(typ),
		backwardsRequestId,
		session,
		writer,
		detailedRequest,
	), nil
}

func dispatchInvocationTask(handle *BackwardsInvocation) {
	requestData := handle.RequestData()
	tenantId, err := handle.TenantID()
	if err != nil {
		handle.WriteError(fmt.Errorf("get tenant id failed: %s", err.Error()))
		return
	}
	requestData["tenant_id"] = tenantId
	userId, err := handle.UserID()
	if err != nil {
		handle.WriteError(fmt.Errorf("get user id failed: %s", err.Error()))
		return
	}
	requestData["user_id"] = userId
	typ := handle.Type()
	requestData["type"] = typ

	for t, v := range dispatchMapping {
		if t == handle.Type() {
			v(handle)
			return
		}
	}

	handle.WriteError(fmt.Errorf("unsupported invoke type: %s", handle.Type()))
}

func genericDispatchTask[T any](
	handle *BackwardsInvocation,
	dispatch func(
		handle *BackwardsInvocation,
		request *T,
	),
) {
	r, err := utils.MapToStruct[T](handle.RequestData())
	if err != nil {
		handle.WriteError(fmt.Errorf("unmarshal backwards invoke request failed: %s", err.Error()))
		return
	}
	dispatch(handle, r)
}

func executeInvocationLLMTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeLLMRequest,
) {
	response, err := handle.backwardsInvocation.InvokeLLM(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke llm model failed: %s", err.Error()))
		return
	}

	for response.Next() {
		value, err := response.Read()
		if err != nil {
			handle.WriteError(fmt.Errorf("read llm model failed: %s", err.Error()))
			return
		}
		handle.WriteResponse("stream", value)
	}
}

func executeInvocationToolTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeToolRequest,
) {
	response, err := handle.backwardsInvocation.InvokeTool(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke tool model failed: %s", err.Error()))
		return
	}

	for response.Next() {
		value, err := response.Read()
		if err != nil {
			handle.WriteError(fmt.Errorf("read tool failed: %s", err.Error()))
			return
		}
		handle.WriteResponse("stream", value)
	}
}

func executeInvocationLLMStructuredOutputTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeLLMWithStructuredOutputRequest,
) {
	response, err := handle.backwardsInvocation.InvokeLLMWithStructuredOutput(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke llm with structured output model failed: %s", err.Error()))
		return
	}

	for response.Next() {
		value, err := response.Read()
		if err != nil {
			handle.WriteError(fmt.Errorf("read llm with structured output model failed: %s", err.Error()))
			return
		}
		handle.WriteResponse("stream", value)
	}
}

func executeInvocationTextEmbeddingTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeTextEmbeddingRequest,
) {
	response, err := handle.backwardsInvocation.InvokeTextEmbedding(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke text-embedding model failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationRerankTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeRerankRequest,
) {
	response, err := handle.backwardsInvocation.InvokeRerank(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke rerank model failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationTTSTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeTTSRequest,
) {
	response, err := handle.backwardsInvocation.InvokeTTS(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke tts model failed: %s", err.Error()))
		return
	}

	for response.Next() {
		value, err := response.Read()
		if err != nil {
			handle.WriteError(fmt.Errorf("read tts model failed: %s", err.Error()))
			return
		}

		handle.WriteResponse("stream", value)
	}
}

func executeInvocationSpeech2TextTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeSpeech2TextRequest,
) {
	response, err := handle.backwardsInvocation.InvokeSpeech2Text(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke speech2text model failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationModerationTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeModerationRequest,
) {
	response, err := handle.backwardsInvocation.InvokeModeration(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke moderation model failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationAppTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeAppRequest,
) {
	response, err := handle.backwardsInvocation.InvokeApp(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke app failed: %s", err.Error()))
		return
	}

	userId, err := handle.UserID()
	if err != nil {
		handle.WriteError(fmt.Errorf("get user id failed: %s", err.Error()))
		return
	}

	request.UserID = userId

	for response.Next() {
		value, err := response.Read()
		if err != nil {
			handle.WriteError(fmt.Errorf("read app failed: %s", err.Error()))
			return
		}

		handle.WriteResponse("stream", value)
	}
}

func executeInvocationParameterExtractor(
	handle *BackwardsInvocation,
	request *invocation.InvokeParameterExtractorRequest,
) {
	response, err := handle.backwardsInvocation.InvokeParameterExtractor(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke parameter extractor failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationQuestionClassifier(
	handle *BackwardsInvocation,
	request *invocation.InvokeQuestionClassifierRequest,
) {
	response, err := handle.backwardsInvocation.InvokeQuestionClassifier(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke question classifier failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationStorageTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeStorageRequest,
) {
	if handle.session == nil {
		handle.WriteError(fmt.Errorf("session not found"))
		return
	}

	// todo
}

func executeInvocationSystemSummaryTask(
	handle *BackwardsInvocation,
	request *invocation.InvokeSummaryRequest,
) {
	response, err := handle.backwardsInvocation.InvokeSummary(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("invoke summary failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationUploadFileTask(
	handle *BackwardsInvocation,
	request *invocation.UploadFileRequest,
) {
	response, err := handle.backwardsInvocation.UploadFile(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("upload file failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}

func executeInvocationFetchAppTask(
	handle *BackwardsInvocation,
	request *invocation.FetchAppRequest,
) {
	response, err := handle.backwardsInvocation.FetchApp(request)
	if err != nil {
		handle.WriteError(fmt.Errorf("fetch app failed: %s", err.Error()))
		return
	}

	handle.WriteResponse("struct", response)
}
