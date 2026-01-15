import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { DepResponse } from "../types/dep-response.type";
import { DepInputArgs } from "../types/dep-input.args";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
export class CreateDepResolver {
  constructor(private readonly depService: DepService) { }

  @Mutation(() => DepResponse)
  @UseGuards(EditionSelfHostedGuard)
  async createDep(@Args('input') input: DepInputArgs, @CurrentTenent() tenant: any): Promise<DepResponse> {
    const createDto = {
      key: input.key!, // 使用非空断言，实际应有验证
      name: input.name!,
      parent: input.parent || '', // 提供默认值
      remarks: input.remarks || '',
      managerId: input.managerId || 0,
      tenantId: tenant.id,
    };
    const createRes = await this.depService.create(createDto);
    const id = createRes.id || 0;
    return { id };
  }
}