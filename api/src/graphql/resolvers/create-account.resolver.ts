import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "src/account/account.service";
import { AccountResponse } from "../types/account-response.type";
import { AccountInput } from "../types/account-input.type";
import { CurrentUser } from "src/common/decorators/current-user";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@UseGuards(GqlAuthGuard)
@Resolver()
export class CreateAccountResolver {
    constructor(private readonly accountService: AccountService) {}

    @Mutation(() => AccountResponse)
    async createAccount(@Args('input') input: AccountInput, @CurrentUser() user: any): Promise<AccountResponse> {
        const dto = {
            username: input.username,
            realName: input.realName,
            password: input.password,
            email: input.email,
            status: input.status,
            mobile: input.mobile,
            createdBy: user.name,
            roles: input.roles
        };
        const createRes = await this.accountService.create(dto);
        const id = createRes.id;
        return { id };
    }
}