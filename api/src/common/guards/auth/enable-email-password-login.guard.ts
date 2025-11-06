import { FeatureService } from "@/service/feature.service";
import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class EnableEmailPasswordLoginGuard implements CanActivate {
    constructor(
        private readonly featureService: FeatureService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const feature = await this.featureService.getFeatures()

        if (!feature.enableEmailPasswordLogin) {
            throw new NotFoundException();
        }

        return true;
    }
}