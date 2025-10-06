package plugin_entities

type OAuthSchema struct {
	// ClientSchema contains client_id, client_secret, redirect_uri, etc. Which are required to be set by admin
	ClientSchema []ProviderConfig `json:"client_schema" yaml:"client_schema" validate:"omitempty,dive"`

	// CredentialsSchema contains schema of access_token, refresh_token, etc.
	CredentialsSchema []ProviderConfig `json:"credentials_schema" yaml:"credentials_schema" validate:"omitempty,dive"`
}
