package backwards_invocation

type RequestEvent string

const (
	REQUEST_EVENT_RESPONSE RequestEvent = "response"
	REQUEST_EVENT_ERROR    RequestEvent = "error"
	REQUEST_EVENT_END      RequestEvent = "end"
)

type BackwardsInvocationResponse struct {
	BackwardsRequestId string       `json:"backwards_request_id"`
	Event              RequestEvent `json:"event"`
	Message            string       `json:"message"`
	Data               any          `json:"data"`
}

func NewBackwardsInvocationResponse(requestId, message string, data any) *BackwardsInvocationResponse {
	return &BackwardsInvocationResponse{
		BackwardsRequestId: requestId,
		Event:              REQUEST_EVENT_RESPONSE,
		Message:            message,
		Data:               data,
	}
}

func NewBackwardsInvocationError(requestId, message string) *BackwardsInvocationResponse {
	return &BackwardsInvocationResponse{
		BackwardsRequestId: requestId,
		Event:              REQUEST_EVENT_ERROR,
		Message:            message,
		Data:               nil,
	}
}

func NewBackwardsInvocationEnd(requestId string) *BackwardsInvocationResponse {
	return &BackwardsInvocationResponse{
		BackwardsRequestId: requestId,
		Event:              REQUEST_EVENT_END,
		Message:            "",
		Data:               nil,
	}
}
