package requests

type RequestInvokeEndPoint struct {
	RawHttpRequest string         `json:"raw_http_request" validate:"required"`
	Settings       map[string]any `json:"settings" validate:"required"`
}
