import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountService } from "@/account/account.service";
import * as bcypt from 'bcrypt';
import { LoginResponse } from "@/graphql/account/account/types/login-response.type";
import { JWT_CONSTANTS } from "@/config/constants";
import { I18n, I18nService } from "nestjs-i18n";
import { I18nTranslations } from "@/generated/i18n.generated";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    @I18n()
    private readonly i18n: I18nService<I18nTranslations>
  ) { }

  async validateUser(name: string, password: string): Promise<any> {
    const account = await this.accountService.getByUserName(name, true);
    if (!account) {
      throw new BadRequestException(this.i18n.t('account.ACCOUNT_NOT_EXIST', { args: { name } }));
    }
    const cmp = bcypt.compareSync(password, account.password);
    if (cmp) {
      const { password, ...rest } = account;
      return rest;
    }
    throw new BadRequestException(this.i18n.t('auth.PASSWORD_INVALID', { args: { key: name } }));
  }

  async login(user: any): Promise<LoginResponse> {
    const userId = user?.id ?? 0;
    if (!userId) {
      throw new BadRequestException(this.i18n.t('account.ACCOUNT_ID_NOT_EXISTS', { args: { name } }));
    }
    const payload = { name: user.username, sub: userId };
    const access_token = this.jwtService.sign(payload, {
      secret: JWT_CONSTANTS.secret,
      expiresIn: JWT_CONSTANTS.expiresIn,
    });
    const roleKeys = user.roles?.map((role) => role.key) || [];
    return {
      access_token,
      name: user.realName ? user.realName : user.username,
      roles: roleKeys,
      isSuper: this.isSuperAdmin(roleKeys),
      expiresIn: this.getExpiresIn(JWT_CONSTANTS.expiresIn),
    }
  }

  private getExpiresIn(expiresIn: string): number {
    // 将 '15m', '24h' 等转换为秒数
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 24 * 60 * 60; // 默认24小时
    }
  }

  isSuperAdmin(roles: string[]): boolean {
    return roles.length > 0 && roles.indexOf('admin') >= 0;
  }
}