import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { LoginResponse, UserInfoResponse } from "../types/login-response.type";
import { EmailCodeLoginInput, LoginInput } from "../types/login-input.type";
import { AuthService } from "@/auth/auth.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { AuthAccountService } from "@/service/auth-account.service";

@Resolver()
export class LoginResolver {
    constructor(
        private readonly accountService: AccountService,
        private readonly authService: AuthService,
        private readonly authAccountService: AuthAccountService,
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

    @Mutation(() => EmailCodeLoginInput)
    async emailCodeLogin(@Args('input') input: EmailCodeLoginInput): Promise<LoginResponse> {
        return this.authAccountService
            .validateEmailCodeLogin(input.email, input.token, input.code)
            .then(user => {
                return this.authService.login(user)
            });
    }
}