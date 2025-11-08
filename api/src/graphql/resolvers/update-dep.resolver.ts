import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { DepResponse } from "../types/dep-response.type";
import { DepInput } from "../args/dep-input.args";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class UpdateDepResolver {
    constructor(private readonly depService: DepService) { }

    @Mutation(() => DepResponse)
    async updateDep(@Args('input') input: DepInput): Promise<DepResponse> {
        const createDto = {
            key: input.key!, // 使用非空断言，实际应有验证
            name: input.name!,
            parent: input.parent || '', // 提供默认值
            remarks: input.remarks || '',
            managerId: input.managerId || 0
        };
        const updateRes = await this.depService.update(createDto);
        const id = updateRes?.id || 0;
        return { id };
    }
}