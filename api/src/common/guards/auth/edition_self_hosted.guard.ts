import { EditionType } from "@/monie/enums/version.enum";
import { SystemService } from "@/monie/system.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class EditionSelfHostedGuard implements CanActivate {

    constructor(
        private readonly systemService: SystemService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const edition = this.systemService.edition;

        if (edition != EditionType.SELF_HOSTED) {
            throw new ForbiddenException();
        }

        return true;
    }

}
