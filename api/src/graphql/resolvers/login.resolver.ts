import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { LoginResponse, UserInfoResponse } from "../types/login-response.type";
import { EmailCodeLoginInput, LoginInput } from "../types/login-input.type";
import { AuthService } from "@/auth/auth.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { Req, UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { AuthAccountService } from "@/service/auth-account.service";
import { DeviceService } from "@/service/libs/device.service";
import { Request } from "express";

@Resolver()
export class LoginResolver {
    constructor(
        private readonly accountService: AccountService,
        private readonly authService: AuthService,
        private readonly authAccountService: AuthAccountService,
        private readonly deviceService: DeviceService,
    ) { }

    @Mutation(() => LoginResponse)
    async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
        return this.authService
            .validateUser(input.username, input.password)
            .then(user => {
                return this.authService.login(user)
            });
    }

    @UseGuards(GqlAuthGuard)
    @Query(() => UserInfoResponse)
    async currentUser(@CurrentUser() user: any): Promise<UserInfoResponse> {
        return {
            id: user.id,
            name: user.name
        };
    }

    @Mutation(() => LoginResponse)
    async emailCodeLogin(@Args('input') input: EmailCodeLoginInput, @Req() req: Request): Promise<LoginResponse> {
        const deviceInfo = this.deviceService.getDeviceInfo(req.headers['user-agent'] || '', req.headers['accept-language']);
        return this.authAccountService
            .validateEmailCodeLogin(input.email, input.token, input.code, deviceInfo.language)
            .then(user => {
                return this.authService.login(user)
            });
    }
}