import { AccountService } from "@/account/account.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { I18nTranslations } from "@/generated/i18n.generated";
import { AccountNotFoundError } from "@/service/exceptions/account.error";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, Mutation } from "@nestjs/graphql";
import { I18nService } from "nestjs-i18n";
import { UpdateAccountDto } from "@/account/account/dto/update-account.dto";
import { UpdateAccountAvatarInput, UpdateAccountLanguageInput, UpdateAccountNameInput, UpdateAccountThemeInput } from "../types/account-input.type";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
export class UpdateAccountFieldsResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) { }

  @Mutation(() => Boolean)
  async updateAccountName(
    @Args('input') input: UpdateAccountNameInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    if (input.username.length < 2 || input.username.length > 30) {
      throw new BadRequestException("Account name length error.");
    }

    const dto: UpdateAccountDto = {
      username: input.username,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountAvatar(
    @Args('input') input: UpdateAccountAvatarInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      avatar: input.avatar,
      updatedBy: user.name,
    }

    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountLanguage(
    @Args('input') input: UpdateAccountLanguageInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      language: input.language,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }

  @Mutation(() => Boolean)
  async updateAccountTheme(
    @Args('input') input: UpdateAccountThemeInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    const account = await this.accountService.getById(user.id);
    if (!account) {
      throw AccountNotFoundError.create(this.i18n);
    }

    const dto: UpdateAccountDto = {
      theme: input.theme,
      updatedBy: user.name,
    };

    await this.accountService.update(dto);
    return true;
  }
}

