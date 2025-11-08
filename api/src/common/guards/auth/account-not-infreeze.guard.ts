import { AccountService } from "@/account/account.service";
import { I18nTranslations } from "@/generated/i18n.generated";
import { AuthAccountService } from "@/service/auth-account.service";
import { EmailInFreezeError } from "@/service/exceptions/account.error";
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { I18nService } from "nestjs-i18n";

@Injectable()
export class AccountNotInFreezeGuard implements CanActivate {
    constructor(
        private readonly accountService: AccountService,
        private readonly authAccountService: AuthAccountService,
        private readonly i18n: I18nService<I18nTranslations>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user;

        if (!user) {
            throw new BadRequestException("Invalid user context");
        }

        const account = await this.accountService.getById(user.id);
        if (!account) {
            throw new BadRequestException("Account does not exists");
        }

        const inFreeze = await this.authAccountService.isAccountFreezed(account.email);
        if (inFreeze) {
            throw EmailInFreezeError.create(this.i18n);
        }

        return true;
    }
}
