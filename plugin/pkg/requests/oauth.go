package requests

type RequestOAuthGetAuthorizationURL struct {
	Provider          string         `json:"provider" validate:"required"`
	RedirectURL       string         `json:"redirect_url" validate:"required"`
	SystemCredentials map[string]any `json:"system_credentials" validate:"omitempty"`
}

type RequestOAuthGetCredentials struct {
	Provider          string         `json:"provider" validate:"required"`
	RedirectURL       string         `json:"redirect_url" validate:"required"`
	SystemCredentials map[string]any `json:"system_credentials" validate:"omitempty"`
	RawHttpRequest    string         `json:"raw_http_request" validate:"required"`
}

type RequestOauthRefreshCredentials struct {
	Provider          string         `json:"provider" validate:"required"`
	RedirectURL       string         `json:"redirect_url" validate:"required"`
	SystemCredentials map[string]any `json:"system_credentials" validate:"omitempty"`
	Credentials       map[string]any `json:"credentials" validate:"required"`
}
