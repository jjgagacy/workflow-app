import { Args, Query, Resolver } from "@nestjs/graphql";
import { ModuleList } from "../types/module-list.type";
import { GetModuleArgs } from "../args/get-module.args";
import { ModuleService } from "@/account/module.service";
import { Module } from "../types/module.type";
import { ModuleEntity } from "@/account/entities/module.entity";
import { validNumber } from "@/common/utils/strings";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class ModuleResolver {
    constructor(
        private readonly moduleService: ModuleService
    ) { }

    @Query((returns) => ModuleList)
    async modules(@Args() args: GetModuleArgs): Promise<ModuleList> {
        const { data: moduleEntities, total } = await this.moduleService.query({
            key: args.key,
            name: args.name,
            ...(validNumber(args.page) && validNumber(args.limit) && { page: args.page, limit: args.limit }),
            relations: { perms: true }
        });

        // 2. 转换实体为GraphQL类型
        const modules: Module[] = moduleEntities.map(this.transformModuleToGQLType);

        // 3. 返回分页结果
        return {
            data: modules,
            ...(validNumber(args.page) && validNumber(args.limit) && {
                pageInfo: {
                    page: args.page ?? 0,
                    pageSize: args.limit ?? 0,
                    total: total ?? 0
                }
            })
        } as ModuleList;
    }

    /**
     * 将ModuleEntity转换为GraphQL Module类型
     */
    private transformModuleToGQLType(module: ModuleEntity): Module {
        return {
            id: module.id,
            key: module.key,
            name: module.name,
            perms: module.perms?.map(perm => ({
                key: perm.key,
                name: perm.name,
                restrictLevel: perm.restrictLevel
            }))
        };
    }
}