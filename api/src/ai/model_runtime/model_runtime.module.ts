import { Module } from '@nestjs/common';
import { ModelTypeService } from './model-type.service';
import { ProviderListService } from './services/provider-list.service';
import { PluginModelProvider } from './classes/plugin/model-provider';
import { PluginModule } from '../plugin/plugin.module';
import { PluginModelClientService } from '../plugin/services/plugin-model-client.service';
import { ProviderCredentialsCacheService } from './services/provider-credentials-cache.service';
import { StorageModule } from '@/storage/storage.module';
import { StorageService } from '@/storage/storage.service';
import { ProviderService } from './services/provider.service';
import { ProviderManager } from './services/provider-manager';
import { EncryptionService } from '@/encryption/encryption.service';
import { EncryptionModule } from '@/encryption/encryption.module';

@Module({
  imports: [PluginModule, StorageModule, EncryptionModule],
  providers: [
    ModelTypeService,
    ProviderListService,
    PluginModelProvider,
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
    PluginModelProvider,
    ProviderCredentialsCacheService
  ]
})
export class ModelRuntimeModule { }
