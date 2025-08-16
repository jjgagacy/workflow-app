import { Args, Query, Resolver } from "@nestjs/graphql";
import { DepService } from "src/account/dep.service";
import { Dep } from "../types/dep.type";
import { GetDepArgs } from "../args/get-dep.args";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DepResolver {
    constructor(private readonly depService: DepService) {}

    @Query(() => [Dep])
    async deps(@Args() args: GetDepArgs): Promise<Dep[]> {
        const depList = await this.depService.getDeps();
        const flatternDepTree = (tree: any[], result: Dep[] = []): Dep[] => {
            return tree.reduce((acc, department) => {
                acc.push(this.transformDepToGraphqlType(department));
                // 递归处理子部门
                if (department.children?.length) {
                    return flatternDepTree(department.children, acc);
                }
                return acc;
            }, result);
        };
        return flatternDepTree(depList);
    }

    transformDepToGraphqlType(department: any): Dep {
        return {
            id: department.id,
            key: department.key,
            name: department.name,
            parent: department.parent,
            remarks: department.remarks,
            manager: department.manager ?? null, // 使用空值合并运算符
            // 可以添加更多需要的字段
        } as Dep;
    }
}