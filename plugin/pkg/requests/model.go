package requests

type Credentials struct {
	Credentials    map[string]any `json:"credentials" validate:"omitempty"`
	CredentialType string         `json:"credential_type" validate:"omitempty"`
}

type BaseRequestInvokeModel struct {
	Provider string `json:"provider" validate:"required"`
	Model    string `json:"model" validate:"required"`
}
