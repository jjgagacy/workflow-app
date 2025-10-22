import { AccountService } from "@/account/account.service";
import { AccountEntity } from "@/account/entities/account.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { EnhanceCacheService } from "./caches/enhance-cache.service";

@Injectable()
export class AuthAccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        private readonly accountService: AccountService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly cacheService: EnhanceCacheService,
    ) { }

    async test() {
        const account = await this.accountRepository.findOne({ where: { id: 1 } });
        console.log('account', account);
        const accountSame = await this.accountService.getByUserName('admin');
        console.log('account', accountSame);
        const value = await this.cacheManager.get<string>('key');
        console.log('cahce value:', value);
        const redisClient = await this.cacheService.getRedisClient();
        // await redisClient.rPush('la', ['foo', 'bar']);
        console.log('client', await redisClient.lRange('la', 0, -1))
    }
}
