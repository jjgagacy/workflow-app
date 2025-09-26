package constants

import (
	"github.com/go-playground/validator/v10"
	"github.com/jjgagacy/workflow-app/plugin/pkg/validators"
)

type Arch string

const (
	AMD64 Arch = "amd64"
	ARM64 Arch = "arm64"
)

var ValidArchs = map[Arch]bool{
	AMD64: true,
	ARM64: true,
}

func isArch(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	return ValidArchs[Arch(value)]
}

func init() {
	validators.EntitiesValidator.RegisterValidation("is_arch", isArch)
}
