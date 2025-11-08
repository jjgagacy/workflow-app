import { Args, Query, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { AccountList } from "../types/account-list.type";
import { GetAccountArgs } from "../args/get-account.args";
import { Account } from "../types/account.type";
import { formatDate } from "@/common/utils/time";
import { AccountEntity } from "@/account/entities/account.entity";
import { validNumber } from "@/common/utils/strings";
import { AuthService } from "@/auth/auth.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { BadRequestGraphQLException } from "@/common/exceptions";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@UseGuards(GqlAuthGuard)
@Resolver()
export class AccountResolver {
    constructor(private readonly accountService: AccountService,
        private readonly authService: AuthService
    ) { }

    @Query(() => AccountList)
    @UseGuards(EditionSelfHostedGuard)
    async accounts(@Args() args: GetAccountArgs): Promise<AccountList> {
        const { data: accountList, total } = await this.accountService.query({ ...args, relations: { roles: true } });
        const data: Account[] = accountList.map(this.transformAccountToGQLType);
        return {
            data,
            ...(validNumber(args.page) && validNumber(args.limit) && {
                pageInfo: {
                    page: args.page ?? 0,
                    pageSize: args.limit ?? 0,
                    total: total ?? 0
                }
            })
        };
    }

    private transformAccountToGQLType(account: AccountEntity): Account {
        const { roles } = account;
        return {
            id: account.id,
            username: account.username,
            email: account.email,
            mobile: account.mobile,
            status: account.status,
            realName: account.realName,
            created_at: formatDate(new Date(account.operate.createdAt)),
            created_by: account.operate.createdBy,
            roles: roles?.map((role) => role.name),
            roleKeys: roles?.map((role) => role.key),
        } as Account;
    }

    @Query(() => Account)
    async accountInfo(): Promise<Account> {
        throw new BadRequestGraphQLException('Not implemented yet');
    }
}
