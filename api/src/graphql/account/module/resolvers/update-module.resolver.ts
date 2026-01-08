import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "@/account/module.service";
import { ModuleResponse } from "../types/module-response.type";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { ModuleInput } from "../types/module-input.type";
import { CurrentTenent } from "@/common/decorators/current-tenant";
import { UpdateModuleDto } from "@/account/module/dto/update-module.dto";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class UpdateModuleResolver {
  constructor(
    private readonly moduleService: ModuleService
  ) { }

  @Mutation(() => ModuleResponse)
  async updateModule(@Args('input') input: ModuleInput, @CurrentTenent() tenant: any): Promise<ModuleResponse> {
    const dto = { ...input, tenantId: tenant.id } as UpdateModuleDto;
    const moduleEntity = await this.moduleService.update(dto);
    return { id: moduleEntity.id };
  }
}