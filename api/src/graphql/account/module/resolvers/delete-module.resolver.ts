import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { ModuleService } from "@/account/module.service";
import { UseGuards } from "@nestjs/common";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { CurrentTenent } from "@/common/decorators/current-tenant";

@Resolver()
@UseGuards(EditionSelfHostedGuard)
export class DeleteModuleResolver {
  constructor(private readonly moduleService: ModuleService) { }

  @Mutation(() => Boolean)
  async deleteModule(@Args({ name: 'id', type: () => Int }) id: number, @CurrentTenent() tenant: any): Promise<Boolean> {
    await this.moduleService.deleteByIds([id], tenant.id);
    return true;
  }
}