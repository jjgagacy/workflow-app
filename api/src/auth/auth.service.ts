import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountService } from "@/account/account.service";
import { errorObject } from "@/common/types/errors/error";
import * as bcypt from 'bcrypt';
import { LoginResponse } from "@/graphql/types/login-response.type";
import { JWT_CONSTANTS } from "@/config/constants";
import { Http } from "winston/lib/winston/transports";

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService,
        private readonly accountService: AccountService
    ) { }

    async validateUser(name: string, password: string): Promise<any> {
        const account = await this.accountService.getByUserName(name, true);
        if (!account) {
            throw new BadRequestException(errorObject("账户不存在", { key: name }));
        }
        const cmp = bcypt.compareSync(password, account.password);
        if (cmp) {
            const { password, ...rest } = account;
            return rest;
        }
        throw new BadRequestException(errorObject('密码错误', { key: name }));
    }

    async login(user: any): Promise<LoginResponse> {
        const userId = user?.id ?? 0;
        if (!userId) {
            throw new BadRequestException(errorObject("登录失败"));
        }
        const payload = { name: user.username, sub: userId };
        const access_token = this.jwtService.sign(payload, { secret: JWT_CONSTANTS.secret });
        return {
            access_token,
            name: user.realName ? user.realName : user.username,
            roles: user.roles?.map((role) => role.key),
            isSuper: this.isSuperAdmin(user.roles?.map((role) => role.key)),
        }
    }

    isSuperAdmin(roles: string[]): boolean {
        return roles.length > 0 && roles.indexOf('admin') >= 0;
    }
}