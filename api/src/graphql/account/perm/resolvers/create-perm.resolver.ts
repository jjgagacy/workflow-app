import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModulePermManageService } from "@/account/module-perm-manage.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { PermInput } from "../types/perm-input.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { TenantContextGuard } from "@/common/guards/tenant-context.guard";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(TenantContextGuard)
@UseGuards(EditionSelfHostedGuard)
export class CreatePermResolver {
  constructor(private readonly modulePermManageService: ModulePermManageService) { }

  @Mutation(() => Boolean)
  async createPerm(@Args('input') input: PermInput, @CurrentTenent() tenant: any): Promise<boolean> {
    const dto = { ...input, tenantId: tenant.id } as CreateModulePermArgs;
    await this.modulePermManageService.create(dto);
    return true;
  }
}