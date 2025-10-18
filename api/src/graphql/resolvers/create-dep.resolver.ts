import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { DepResponse } from "../types/dep-response.type";
import { DepInput } from "../args/dep-input.args";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@UseGuards(GqlAuthGuard)
@Resolver()
export class CreateDepResolver {
    constructor(private readonly depService: DepService) { }

    @Mutation(() => DepResponse)
    async createDep(@Args('input') input: DepInput): Promise<DepResponse> {
        const createDto = {
            key: input.key!, // 使用非空断言，实际应有验证
            name: input.name!,
            parent: input.parent || '', // 提供默认值
            remarks: input.remarks || '',
            managerId: input.managerId || 0
        };
        const createRes = await this.depService.create(createDto);
        const id = createRes.id || 0;
        return { id };
    }
}