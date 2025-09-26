package service

import (
	"errors"
	"io"
	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
)

func UploadPluginPkg(
	config *core.Config,
	ctx *gin.Context,
	tenantId string,
	pkgFile multipart.File,
	verifySignature bool,
) *entities.Response {
	pluginFile, err := io.ReadAll(pkgFile)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	pluginDecoder, err := decoder.NewZipPluginDecoderWithLimitSize(pluginFile, config.MaxPluginPackageSize)
	if err != nil {
		return entities.BadRequestError(err).ToResponse()
	}

	pluginUniqueIdentifier, err := pluginDecoder.UniqueIdentity()
	if err != nil {
		return entities.BadRequestError(err).ToResponse()
	}

	if pluginUniqueIdentifier.RemoteLike() {
		return entities.BadRequestError(errors.New("author cannot be a uuid")).ToResponse()
	}

	manager := plugin_manager.Manager()
	declaration, err := manager.SavePackage(pluginUniqueIdentifier, pluginFile, &decoder.ThirdPartySignatureVerificationConfig{
		Enabled:        config.ThirdPartySignatureVerificationEnabled,
		PublicKeyPaths: config.ThirdPartySignatureVerificationPublicKeys,
	})
	if err != nil {
		return entities.BadRequestError(errors.Join(err, errors.New("failed to save package"))).ToResponse()
	}

	if verifySignature {
		if !declaration.Verified {
			return entities.BadRequestError(errors.Join(err, errors.New("signagure invalid"))).ToResponse()
		}
	}

	return entities.NewSuccessResponse(map[string]any{
		"unique_identifier": pluginUniqueIdentifier,
		"manifest":          declaration,
	})
}
