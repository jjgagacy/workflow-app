import { Public } from "@/common/guards/universal-auth.guard";
import { Args, Resolver } from "@nestjs/graphql";
import { GetModelProvidersArgs } from "../types/get-model-providers.args";
import { ModelProvidersList } from "../types/model-providers-list.type";

@Resolver()
export class ModelProvidersResolver {

  @Public()
  async modelProviders(
    @Args() args: GetModelProvidersArgs
  ): Promise<ModelProvidersList> {

    throw new Error("Not implemented yet");
  }

}