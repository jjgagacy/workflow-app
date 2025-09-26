package manifest_entites

import (
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type Version string

func (v Version) String() string {
	return string(v)
}

const (
	VERSION_PATTERN   = `\d{1,4}(\.\d{1,4}){2}(-\w{1,16})?`
	VERSION_X_PATTERN = `(\d{1,4}|[xX])`
)

var PluginDeclarationVersionRegex = regexp.MustCompile("^" + VERSION_PATTERN + "$")

func isVersion(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return PluginDeclarationVersionRegex.MatchString(value)
}

func init() {
	validators.EntitiesValidator.RegisterValidation("is_version", isVersion)
}
