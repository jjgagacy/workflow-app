import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { AccountService } from "@/account/account.service";
import { AccountResponse } from "../types/account-response.type";
import { AccountInput } from "../types/account-input.type";
import { CurrentUser } from "@/common/decorators/current-user";
import { UpdateAccountDto } from "@/account/account/dto/update-account.dto";
import { BadRequestException } from "@nestjs/common";
import { errorObject } from "@/common/types/errors/error";
import * as bcrypt from 'bcrypt';
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@UseGuards(GqlAuthGuard)
@Resolver()
export class UpdateAccountResolver {
    constructor(private readonly accountService: AccountService) { }

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
        if (!password?.trim()) throw new BadRequestException(errorObject('当前密码不能为空'));
        if (!newPassword?.trim()) throw new BadRequestException(errorObject('新密码不能为空'));
        if (newPassword.length < 8) throw new BadRequestException(errorObject('新密码至少需要8个字符'));
        // 2. 获取用户账户信息
        const account = await this.accountService.getById(user.id);
        if (!account) throw new BadRequestException(errorObject('账户不存在'));
        // 3. 验证当前密码
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            throw new BadRequestException(errorObject('当前密码不正确'));
        }
        // 4. 密码强度验证
        if (!this.isPasswordStrong(newPassword)) {
            throw new BadRequestException(errorObject('新密码必须包含大小写字母和数字'));
        }
        const dto: UpdateAccountDto = {
            id: user.id,
            password: newPassword,
            updatedBy: user.name
        }
        const updateRes = await this.accountService.update(dto);
        if (!updateRes) throw new BadRequestException(errorObject("更新密码失败"));
        return true;
    }

    // 密码强度检查方法
    private isPasswordStrong(password: string): boolean {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return strongRegex.test(password);
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