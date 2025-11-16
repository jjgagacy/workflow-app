import { DefaultValues, ServiceCache } from "@/common/decorators/cache/service-cache.decorator";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class GeneralCacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    @ServiceCache({ key: 'findAllCats', ttl: 200, skipCache: (a: number) => a == -1 })
    async findAll(a = 3): Promise<string> {
        console.log('findAll called');
        return 'find all cats';
    }

    @ServiceCache({ key: 'findItem', ttl: 300, useArgs: true, enabled: false })
    @DefaultValues(2, { foo: 'bar' })
    static findItem(a = 2, b = { foo: 'bar' }) {
        console.log('disabled cache');
        return ['item 1', 'item 2'];
    }

    @ServiceCache({ key: 'findOne', enabled: false })
    async findOne() {
        console.log('findOne')
        return "findOne";
    }
}
