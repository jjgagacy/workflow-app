import { Command, CommandRunner } from 'nest-commander';
import { MarketplaceService } from '@/service/marketplace.service';

/**
 * 清除系统缓存 npm run cli -- cache:clear
 */
@Command({
  name: 'cache:clear',
  description: '清除应用缓存',
})
export class ClearCacheCommand extends CommandRunner {
  constructor(private readonly marketplaceService: MarketplaceService) {
    super();
  }

  async run(): Promise<void> {
    // 清除缓存的模型
    await this.marketplaceService.clearPluginDeclarationsCache();
    console.log('缓存已成功清除!');
  }
}