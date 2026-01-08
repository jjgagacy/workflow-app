import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { UpdateAccountDto } from "@/account/account/dto/update-account.dto";
import * as bcrypt from 'bcrypt';
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { BadRequestException, InternalServerErrorException, UseGuards } from "@nestjs/common";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import authConfig from "@/config/auth.config";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { AccountResponse } from "../types/account-response.type";
import { AccountInput } from "../types/account-input.type";

@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
@Resolver()
export class UpdateAccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  @Mutation(() => AccountResponse)
  async updateAccount(@Args('input') input: AccountInput, @CurrentUser() user: any): Promise<AccountResponse> {
    const dto: UpdateAccountDto = {
      id: input.id,
      username: input.username,
      realName: input.realName,
      email: input.email,
      status: input.status,
      mobile: input.mobile,
      updatedBy: user.name,
      roles: input.roles
    };
    const updateRes = await this.accountService.update(dto);
    const id = updateRes?.id || 0;
    return { id };
  }

  @Mutation(() => Boolean)
  async updateAccountPassword(@CurrentUser() user: any,
    @Args('password', { nullable: false }) password: string,
    @Args('newPassword', { nullable: false }) newPassword: string) {
    // 1. 验证输入参数
    if (!password?.trim()) throw new BadRequestException(this.i18n.t('account.PASSWORD_NOT_EMPTY'));
    if (!newPassword?.trim()) throw new BadRequestException(this.i18n.t('account.PASSWORD_NEW_NOT_EMPTY'));
    if (newPassword.length < 8) throw new BadRequestException(this.i18n.t('account.PASSWORD_FORMAT_INVALID'));
    // 2. 获取用户账户信息
    const account = await this.accountService.getById(user.id);
    if (!account) throw new BadRequestException(this.i18n.t('account.ACCOUNT_NOT_EXIST', { args: { name: user.id } }));
    // 3. 验证当前密码
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new BadRequestException(this.i18n.t('account.PASSWORD_INVALID'));
    }
    // 4. 密码强度验证
    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException(this.i18n.t('account.PASSWORD_FORMAT_INVALID'));
    }
    const dto: UpdateAccountDto = {
      id: user.id,
      password: newPassword,
      updatedBy: user.name
    }
    const updateRes = await this.accountService.update(dto);
    if (!updateRes) throw new InternalServerErrorException(this.i18n.t('system.UPDATE_FAILED'));
    return true;
  }

  // 密码强度检查方法
  private isPasswordStrong(password: string): boolean {
    const passwordPattern = authConfig().passwordPattern;
    return passwordPattern.test(password);
  }

  @Mutation(() => Boolean)
  async toggleAccountStatus(@CurrentUser() user: any, @Args({ name: 'id', type: () => Int }) id: number): Promise<Boolean> {
    const dto: UpdateAccountDto = {
      id: id,
      updatedBy: user.name
    }
    await this.accountService.toggleStatus(dto);
    return true;
  }
}