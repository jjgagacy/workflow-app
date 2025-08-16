import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { DepService } from "src/account/dep.service";
import { DepResponse } from "../types/dep-response.type";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeleteDepResolver {
    constructor(private readonly depService: DepService) {}

    @Mutation(() => Boolean)
    async deleteDep(@Args({ name: 'id', type: () => Int}) id: number): Promise<boolean> {
        await this.depService.deleteByIds([id]);
        return true;
    }
}