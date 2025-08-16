import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "src/account/account.service";
import { LoginResponse } from "../types/login-response.type";
import { LoginInput } from "../types/login-input.type";
import { AuthService } from "src/auth/auth.service";

@Resolver()
export class LoginResolver {
    constructor(private readonly accountService: AccountService,
        private readonly authService: AuthService
    ) {}

    @Mutation(() => LoginResponse)
    async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
        return this.authService
        .validateUser(input.username, input.password)
        .then(user => {
            return this.authService.login(user)
        });
    }
}