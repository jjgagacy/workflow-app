import { Module } from '@nestjs/common';
import { ModelTypeService } from './model-type.service';
import { ProviderListService } from './services/provider-list.service';
import { ModelProviderPlugin } from './classes/plugin/model-provider.plugin';
import { PluginModule } from '../plugin/plugin.model';
import { PluginClientService } from '../plugin/services/plugin-client.service';
import { AIModel } from './classes/ai-model.class';
import { ProviderCredentialsCacheService } from './services/provider-credentials-cache.service';

@Module({
  imports: [PluginModule, AIModel],
  providers: [
    ModelTypeService,
    ProviderListService,
    ModelProviderPlugin,
    PluginClientService,
    ProviderCredentialsCacheService,
  ],
  exports: [ModelTypeService, ProviderListService, ModelProviderPlugin]
})
export class ModelRuntimeModule { }

