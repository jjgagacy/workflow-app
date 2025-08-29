import { Args, Query, Resolver } from "@nestjs/graphql";
import { DepService } from "src/account/dep.service";
import { Dep } from "../types/dep.type";
import { GetDepArgs } from "../args/get-dep.args";
import { GqlAuthGuard } from "src/common/guards/gql-auth.guard";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { AccountService } from "src/account/account.service";
import { AccountEntity } from "src/account/entities/account.entity";
import { errorObject } from "src/common/types/errors/error";

@Resolver()
@UseGuards(GqlAuthGuard)
export class DepResolver {
    constructor(private readonly depService: DepService,
        private readonly accountService: AccountService
    ) {}

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

    @Query(() => Dep)
    async depInfo(@Args({ name: 'key', type: () => String }) key: string): Promise<Dep> {
        const dep = await this.depService.getByKey(key);
        if (!dep) {
            throw new BadRequestException(errorObject('参数key错误', { key }));
        }
        let manager: AccountEntity | null = null;
        if (dep?.managerId) {
            manager = await this.accountService.getById(dep.managerId);
        }
        return this.transformDepToGraphqlType({
            ...dep,
            manager: manager ? {
                id: manager.id,
                username: manager.username,
                realName: manager.realName
            } : null
        });
    }
}