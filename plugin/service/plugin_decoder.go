package service

import (
	"errors"
	"io"
	"mime/multipart"

	"github.com/gin-gonic/gin"
	"github.com/jjgagacy/workflow-app/plugin/cache"
	"github.com/jjgagacy/workflow-app/plugin/core"
	"github.com/jjgagacy/workflow-app/plugin/core/bundle_packager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_manager"
	"github.com/jjgagacy/workflow-app/plugin/core/plugin_packager/decoder"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/bundle_entities"
	"github.com/jjgagacy/workflow-app/plugin/pkg/entities/plugin_entities"
	"github.com/jjgagacy/workflow-app/plugin/types"
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

func UploadPluginBundle(
	config *core.Config,
	ctx *gin.Context,
	tenantId string,
	bundleFile multipart.File,
	verifySignature bool,
) *entities.Response {
	bundleData, err := io.ReadAll(bundleFile)
	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	packager, err := bundle_packager.NewMemoryZipBundlePackager(bundleData)
	if err != nil {
		return entities.BadRequestError(errors.Join(err, errors.New("failed to decode bundle"))).ToResponse()
	}

	bundle, err := packager.Manifest()
	if err != nil {
		return entities.BadRequestError(errors.Join(err, errors.New("failed to load bundle manifest"))).ToResponse()
	}

	manager := plugin_manager.Manager()
	result := []map[string]any{}

	for _, dependency := range bundle.Dependencies {
		if dependency.Type == bundle_entities.DEPENDENCY_TYPE_GITHUB {

		} else if dependency.Type == bundle_entities.DEPENDENCY_TYPE_MARKETPLACE {

		} else if dependency.Type == bundle_entities.DEPENDENCY_TYPE_PACKAGE {

		}
	}

	return entities.NewSuccessResponse(result)
}

func FetchPluginManifest(
	pluginUniqueIdentifier plugin_entities.PluginUniqueIdentifier,
) *entities.Response {
	runtimeType := plugin_entities.PLUGIN_RUNTIME_TYPE_LOCAL
	if pluginUniqueIdentifier.RemoteLike() {
		runtimeType = plugin_entities.PLUGIN_RUNTIME_TYPE_REMOTE
	}

	pluginManifest, err := cache.CombinedGetPluginDeclaration(
		pluginUniqueIdentifier,
		runtimeType,
	)
	if err == types.ErrPluginNotFound {
		return entities.BadRequestError(errors.New("plugin not found")).ToResponse()
	}

	if err != nil {
		return entities.InternalError(err).ToResponse()
	}

	return entities.NewSuccessResponse(pluginManifest)
}
