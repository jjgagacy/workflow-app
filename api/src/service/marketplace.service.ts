import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MarketplaceService {
  constructor(
    protected readonly monieConifig: MonieConfig,
    protected readonly cacheService: EnhanceCacheService
  ) { }

}
