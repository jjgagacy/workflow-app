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
	Path   string         `json:"path" yaml:"path"`
	Method EndPointMethod `json:"method" yaml:"method"`
	Hidden bool           `json:"hidden" yaml:"hidden"`
}

type EndPointProviderDeclaration struct {
	Settings      []ProviderConfig      `json:"settings" yaml:"settings"`
	EndPoints     []EndPointDeclaration `json:"endpoints" yaml:"endpoints"`
	EndPointFiles []string              `json:"-" yaml:"endpoint_files"`
}
