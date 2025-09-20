package plugin_entities

type EndPointMethod string

const (
	EndpointMethodHead    EndPointMethod = "HEAD"
	EndpointMethodGet     EndPointMethod = "GET"
	EndpointMethodPost    EndPointMethod = "POST"
	EndpointMethodPut     EndPointMethod = "PUT"
	EndpointMethodDelete  EndPointMethod = "DELETE"
	EndpointMethodOptions EndPointMethod = "OPTIONS"
)

type EndPointDeclaration struct {
	Path   string         `json:"path"`
	Method EndPointMethod `json:"method"`
	Hidden bool           `json:"hidden"`
}

type EndPointProviderDeclaration struct {
	Settings      []ProviderConfig      `json:"settings"`
	EndPoints     []EndPointDeclaration `json:"endpoints"`
	EndPointFiles []string              `json:"-"`
}
