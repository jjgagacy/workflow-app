import { Module } from '@nestjs/common';
import { ModelTypeService } from './model-type.service';
import { ProviderListService } from './services/provider-list.service';
import { ModelProviderPlugin } from './classes/plugin/model-provider.plugin';
import { PluginModule } from '../plugin/plugin.module';
import { PluginModelClientService } from '../plugin/services/model-client.service';
import { AIModel } from './classes/ai-model.class';
import { ProviderCredentialsCacheService } from './services/provider-credentials-cache.service';
import { StorageModule } from '@/storage/storage.module';
import { StorageService } from '@/storage/storage.service';
import { ProviderService } from './services/provider.service';
import { ProviderManager } from './services/provider-manager';
import { EncryptionService } from '@/encryption/encryption.service';
import { EncryptionModule } from '@/encryption/encryption.module';

@Module({
  imports: [PluginModule, AIModel, StorageModule, PluginModule, EncryptionModule],
  providers: [
    ModelTypeService,
    ProviderListService,
    ModelProviderPlugin,
    PluginModelClientService,
    ProviderCredentialsCacheService,
    EncryptionService,
    StorageService,
    ProviderService,
    ProviderManager
  ],
  exports: [
    ModelTypeService,
    ProviderListService,
    ModelProviderPlugin,
    ProviderCredentialsCacheService
  ]
})
export class ModelRuntimeModule { }

