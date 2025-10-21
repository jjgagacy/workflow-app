import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { LoginResponse, UserInfoResponse } from "../types/login-response.type";
import { LoginInput } from "../types/login-input.type";
import { AuthService } from "@/auth/auth.service";
import { CurrentUser } from "@/common/decorators/current-user";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";

@Resolver()
export class LoginResolver {
    constructor(private readonly accountService: AccountService,
        private readonly authService: AuthService
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
}