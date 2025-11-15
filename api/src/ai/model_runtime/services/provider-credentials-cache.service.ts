import { EnhanceCacheService } from "@/service/caches/enhance-cache.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProviderCredentialsCacheService {
  constructor(
    private readonly cacheService: EnhanceCacheService,
  ) { }


}
