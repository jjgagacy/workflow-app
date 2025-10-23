import { Global, Module } from "@nestjs/common";
import { AuthAccountService } from "./auth-account.service";
import { EnhanceCacheService } from "./caches/enhance-cache.service";

@Global()
@Module({
    providers: [
        AuthAccountService,
        EnhanceCacheService,
    ],
    imports: [],
    exports: [
        AuthAccountService,
        EnhanceCacheService,
    ],
})
export class ServiceModule { }
