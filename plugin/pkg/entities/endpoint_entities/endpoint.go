package endpoint_entities

const (
	HeaderXOriginalHost = "X-Original-Host"
)

type EndpointResponseChunk struct {
	Status  *uint16           `json:"status" validate:"omitempty"`
	Headers map[string]string `json:"headers" validate:"omitempty"`
	Result  *string           `json:"result" validate:"omitempty"`
}
