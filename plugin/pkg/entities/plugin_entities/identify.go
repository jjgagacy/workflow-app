package plugin_entities

import (
	"errors"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/manifest_entites"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type PluginUniqueIdentifier string

var (
	ErrInvalidPluginUniqueIdentifier = errors.New("invalid plugin unique identifier")

	// Format: [author/]plugin_id:version@checksum
	// Example: jjgagacy/my_plugin:1.0.0@d41d8cd98f00b204e9800998ecf8427e
	pluginUniqueIdentifierRegexp = regexp.MustCompile(
		`^(?:([a-z0-9_-]{1,64})\/)?([a-z0-9_-]{1,255})(:([0-9]{1,4})(\.[0-9]{1,4}){1,3})?(-\w{1,16})?(@[a-f0-9]{32,64})?$`,
	)
)

func NewPluginUniqueIdentifier(identifier string) (PluginUniqueIdentifier, error) {
	if !pluginUniqueIdentifierRegexp.MatchString(identifier) {
		return "", ErrInvalidPluginUniqueIdentifier
	}
	return PluginUniqueIdentifier(identifier), nil
}

func (p PluginUniqueIdentifier) String() string {
	return string(p)
}

func (p PluginUniqueIdentifier) PluginID() string {
	parts := strings.Split(p.String(), ":")
	if len(parts) == 2 {
		substring := strings.Split(parts[0], "/")
		if len(substring) == 2 {
			return substring[1]
		}
		return substring[0]
	}
	return p.String()
}

func (p PluginUniqueIdentifier) Checksum() string {
	parts := strings.Split(p.String(), "@")
	if len(parts) == 2 {
		return parts[1]
	}
	return ""
}

func (p PluginUniqueIdentifier) Version() manifest_entites.Version {
	parts := strings.Split(p.String(), ":")
	if len(parts) == 2 {
		substrings := strings.Split(parts[1], "@")
		return manifest_entites.Version(substrings[0])
	}
	return manifest_entites.Version("")
}

func (p PluginUniqueIdentifier) Author() string {
	parts := strings.Split(p.String(), "/")
	if len(parts) == 2 {
		return parts[0]
	}
	return ""
}

// RemoteLike returns true if the author part is a valid UUID (indicating a remote plugin)
func (p PluginUniqueIdentifier) RemoteLike() bool {
	_, err := uuid.Parse(p.Author())
	return err == nil
}

func (p PluginUniqueIdentifier) Validate() error {
	return validators.EntitiesValidator.Var(p, "plugin_unique_identifier")
}

func isValidPluginUniqueIdentifier(fl validator.FieldLevel) bool {
	return pluginUniqueIdentifierRegexp.MatchString(fl.Field().String())
}

func init() {
	validators.EntitiesValidator.RegisterValidation("plugin_unique_identifier", isValidPluginUniqueIdentifier)
}
