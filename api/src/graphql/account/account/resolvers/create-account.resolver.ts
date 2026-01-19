import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { AccountResponse } from "../types/account-response.type";
import { AccountInput } from "../types/account-input.type";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class CreateAccountResolver {
  constructor(private readonly accountService: AccountService) { }

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