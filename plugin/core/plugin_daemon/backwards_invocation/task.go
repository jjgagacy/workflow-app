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

		},
		invocation.INVOKE_TYPE_LLM: func(handle *BackwardsInvocation) {
			genericDispatchTask(handle, executeInvocationLLMTask)
		},
		invocation.INVOKE_TYPE_TEXT_EMBEDDING: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_RERANK: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_TTS: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_SPEECH2TEXT: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_MODERATION: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_APP: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_STORAGE: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_UPLOAD_FILE: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_FETCH_APP: func(handle *BackwardsInvocation) {

		},
		invocation.INVOKE_TYPE_LLM_STRUCTURED_OUTPUT: func(handle *BackwardsInvocation) {

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
	tenatnId, err := handle.TenantID()
	if err != nil {
		handle.WriteError(fmt.Errorf("get tenant id failed: %s", err.Error()))
		return
	}
	requestData["tenant_id"] = tenatnId
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
			handle.WriteError(fmt.Errorf("read llm model faild: %s", err.Error()))
			return
		}
		handle.WriteResponse("stream", value)
	}
}
