import { Args, Query, Resolver } from "@nestjs/graphql";
import { DepService } from "@/account/dep.service";
import { GqlAuthGuard } from "@/common/guards/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { AccountService } from "@/account/account.service";
import { AccountEntity } from "@/account/entities/account.entity";
import { I18nTranslations } from "@/generated/i18n.generated";
import { I18nService } from "nestjs-i18n";
import { BadRequestGraphQLException } from "@/common/exceptions";
import { EditionSelfHostedGuard } from "@/common/guards/auth/edition_self_hosted.guard";
import { Dep } from "../types/dep.type";

@Resolver()
@UseGuards(GqlAuthGuard)
@UseGuards(EditionSelfHostedGuard)
export class DepResolver {
    constructor(
        private readonly depService: DepService,
        private readonly accountService: AccountService,
        private readonly i18n: I18nService<I18nTranslations>
    ) { }

    @Query(() => [Dep])
    async deps(): Promise<Dep[]> {
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
            throw new BadRequestGraphQLException(this.i18n.t('system.DEP_NOT_EXIST', { args: { name: key } }));
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