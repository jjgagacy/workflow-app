package constants

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type Language string

const (
	Node Language = "node"
	Go   Language = "go"
)

var validLanguages = map[Language]bool{
	Node: true,
	Go:   true,
}

func isLanguage(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return validLanguages[Language(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("is_language", isLanguage)
}
