import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { QueryRunner, Repository } from "typeorm";
import { RoleEntity } from "@/account/entities/role.entity";
import { errorObject } from "@/common/types/errors/error";

@Injectable()
export class AccountRoleService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
    ) { }

    async getRoles(account: Pick<AccountEntity, 'id'>): Promise<RoleEntity[]> {
        const { roles } = await this.accountRepository.findOneOrFail({
            relations: { roles: true },
            where: { id: account.id },
            select: ['roles'] // 只选择需要的关联关系
        });
        return roles;
    }

    async assignRoles(accountId: number, roleIds: number[]): Promise<boolean> {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
            relations: ['roles']
        });

        if (!account) {
            throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
        }

        account.roles = roleIds.map(id => ({ id } as RoleEntity));
        await this.accountRepository.save(account);
        return true;
    }

    async assignRolesTrans(
        accountId: number,
        roleIds: number[],
        queryRunner?: QueryRunner
    ): Promise<boolean> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(AccountEntity)
            : this.accountRepository;

        return repository.manager.transaction(async transactionalEntityManager => {
            const account = await transactionalEntityManager.findOne(AccountEntity, {
                where: { id: accountId },
                relations: ['roles']
            });

            if (!account) {
                throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
            }

            account.roles = roleIds.map(id => ({ id } as RoleEntity));
            await transactionalEntityManager.save(account);
            return true;
        });
    }

    async assignRolesFast(accountId: number, roleIds: number[]): Promise<boolean> {
        // 先清除现有关系
        await this.accountRepository
            .createQueryBuilder()
            .relation(AccountEntity, 'roles')
            .of(accountId)
            .remove([]);

        // 添加新关系
        if (roleIds.length > 0) {
            await this.accountRepository
                .createQueryBuilder()
                .relation(AccountEntity, 'roles')
                .of(accountId)
                .add(roleIds);
        }

        return true;
    }

    async appendRoles(accountId: number, ...roleIds: number[]): Promise<boolean> {
        // 获取账户及现有角色
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
            relations: ['roles']
        });

        if (!account) {
            throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
        }

        // 添加新角色
        const newRoles = roleIds.map(id => ({ id } as RoleEntity));
        account.roles = [...(account.roles || []), ...newRoles];

        await this.accountRepository.save(account);
        return true;
    }

    async appendRolesFast(accountId: number, ...roleIds: number[]): Promise<boolean> {
        // 验证账户存在
        const accountExists = await this.accountRepository.findOne({
            where: { id: accountId }
        });
        if (!accountExists) {
            throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
        }
        // 直接添加关系到联结表
        if (roleIds.length > 0) {
            await this.accountRepository
                .createQueryBuilder()
                .relation(AccountEntity, 'roles')
                .of(accountId)
                .add(roleIds);
        }
        return true;
    }

    async appendRolesTrans(
        accountId: number,
        roleIds: number[],
        queryRunner?: QueryRunner
    ): Promise<boolean> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(AccountEntity)
            : this.accountRepository;

        return repository.manager.transaction(async transactionalEntityManager => {
            // 获取账户及现有角色
            const account = await transactionalEntityManager.findOne(AccountEntity, {
                where: { id: accountId },
                relations: ['roles']
            });

            if (!account) {
                throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
            }

            // 添加新角色
            const newRoles = roleIds.map(id => ({ id } as RoleEntity));
            account.roles = [...(account.roles || []), ...newRoles];

            await transactionalEntityManager.save(account);
            return true;
        });
    }

    async clearRoles(accountId: number): Promise<void> {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
            relations: { roles: true }
        });

        if (!account) {
            throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
        }

        account.roles = [];
        await this.accountRepository.save(account);
    }

    async clearRolesFast(accountId: number): Promise<boolean> {
        // 验证账户存在
        const accountExists = await this.accountRepository.exist({
            where: { id: accountId }
        });
        if (!accountExists) {
            throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
        }
        // 直接清空关系表
        await this.accountRepository
            .createQueryBuilder()
            .relation(AccountEntity, 'roles')
            .of(accountId)
            .remove([]);

        return true;
    }

    /**
     * 在事务中使用
     * 
     *   await dataSource.transaction(async manager => {
     *       await accountService.clearRoles(1, manager.queryRunner);
     *   });
     * 
     * @param accountId 
     * @param queryRunner 
     * @returns 
     */
    async clearRolesTrans(
        accountId: number,
        queryRunner?: QueryRunner
    ): Promise<boolean> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(AccountEntity)
            : this.accountRepository;

        return repository.manager.transaction(async transactionalEntityManager => {
            const account = await transactionalEntityManager.findOne(AccountEntity, {
                where: { id: accountId },
                relations: ['roles']
            });

            if (!account) {
                throw new BadRequestException(errorObject("账户ID不存在", { key: accountId }));
            }

            account.roles = [];
            await transactionalEntityManager.save(account);
            return true;
        });
    }


}