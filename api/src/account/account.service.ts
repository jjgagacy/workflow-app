import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Like, Repository } from "typeorm";
import { CreateAccountDto } from "./account/dto/create-account.dto";
import { validate } from "class-validator";
import { errorObject } from "src/common/types/errors/error";
import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT } from "src/config/constants";
import { RoleService } from "src/account/role.service";
import { plainToInstance } from "class-transformer";
import { UpdateAccountDto } from "./account/dto/update-account.dto";
import { QueryAccountDto } from "./account/dto/query-account.dto";

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity) 
        private readonly accountRepository: Repository<AccountEntity>,
        private readonly roleService: RoleService,
    ) {}

    async getByUserName(username: string, roles: boolean = false): Promise<AccountEntity | null> {
        return await this.accountRepository.findOne({
            where: { username },
            relations: { roles: roles }
        });
    }

    async getById(id: number, roles: boolean = false): Promise<AccountEntity | null> {
        return await this.accountRepository.findOne({
            where: { id },
            relations: { roles }
        });
    }

    async create(dto: CreateAccountDto): Promise<AccountEntity> {
        const validateObj = plainToInstance(CreateAccountDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证失败', { key: errors.toString() }),
            );
        }
        const existingAccount = await this.getByUserName(dto.username);
        if (existingAccount) {
            throw new BadRequestException(
                errorObject('用户已存在', { key: dto.username }),
            );
        }
        const accountEntity = this.accountRepository.create({
            ...this.mapBaseFields(dto),
            password: await this.hashPassword(dto.password),
            operate: this.mapOperateFields(dto),
            roles: await this.roleService.resolveRoles(dto.roles)
        });
       
        await this.accountRepository.save(accountEntity);
        return accountEntity;
    }

    async update(dto: UpdateAccountDto): Promise<AccountEntity | null> {
        const validateObj = plainToInstance(UpdateAccountDto, dto);
        const errors = await validate(validateObj);
        if (errors.length > 0) {
            throw new BadRequestException(
                errorObject('DTO验证失败', { key: errors.toString() }),
            );
        }
        if (dto.id === undefined) {
            throw new BadRequestException(
                errorObject('缺少id', { key: 'id' }),
            );
        }
        const account = await this.getById(dto.id);
        if (!account) {
            throw new BadRequestException(
                errorObject('用户不存在', { key: dto.id }),
            );
        }
        if (dto.username && dto.username !== account.username) {
            const accountWithSameUsername = await this.getByUserName(dto.username);
            if (accountWithSameUsername) {
                throw new BadRequestException(
                    errorObject('用户名已存在', { key: dto.username }),
                );
            }
        }
        
        const updatedFields = {
            ...this.mapBaseFields(dto),
            operate: this.mapOperateFields(dto),
        };

        await this.accountRepository.update(account.id, updatedFields);

        const newRoles = await this.roleService.resolveRoles(dto.roles);
        if (newRoles) {
            const account = await this.getById(dto.id);
            if (account) {
                account.roles = newRoles;
                await this.accountRepository.save(account);
            }
        }
        
        return this.accountRepository.findOneBy({ id: account.id });
    }

    async delete(id: number): Promise<void> {
        const existingAccount = await this.getById(id);
        if (!existingAccount) {
            throw new BadRequestException(
                errorObject('用户不存在', { key: id }),
            );
        }
        await this.accountRepository.delete(id);
    }

    private mapBaseFields(dto: CreateAccountDto | UpdateAccountDto): Partial<AccountEntity> {
        return {
            username: dto.username,
            realName: dto.realName,
            email: dto.email,
            mobile: dto.mobile,
            status: dto.status
        };
    }

    private mapOperateFields(dto: CreateAccountDto | UpdateAccountDto) {
        if (dto instanceof CreateAccountDto) {
            return {
                createdAt: dto.createdAt || new Date(),
                createdBy: dto.createdBy,
            };
        } else {
            return {
                updatedAt: dto.updatedAt || new Date(),
                updatedBy: dto.updatedBy
            }
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, PASSWORD_SALT);
    }

    async query(queryParams: Partial<QueryAccountDto> | GetAccountListArgs): Promise<{ data: AccountEntity[]; total: number }> {
        const dto = new QueryAccountDto();

        if (queryParams instanceof CreateAccountDto) {
            Object.assign(dto, queryParams);
        } else {
            dto.setQueryArgs(queryParams as GetAccountListArgs);
        }

        // 构建查询条件
        const where: FindOptionsWhere<AccountEntity> = {
            ...(dto.id !== undefined && { id: dto.id }),
            ...(dto.username !== undefined && { username: Like(`%${dto.username}%`) }),
            ...(dto.realName !== undefined && { realName: Like(`%${dto.realName}%`) }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.email !== undefined && { email: Like(`%${dto.email}%`) }),
            ...(dto.mobile !== undefined && { mobile: dto.mobile }),
            ...(dto.roleId !== undefined && { roles: { id: dto.roleId } })
        };
        // 构建排序
        const order: FindOptionsOrder<AccountEntity> = { ...dto.order };
        // 构建查询选项
        const options: FindManyOptions<AccountEntity> = {
            where,
            order,
            ...(dto.relations && { relations: dto.relations }),
            ...(dto.paginate && { skip: dto.skip || 0, take: dto.limit || 10 })
        };
  
        // 执行查询
        if (dto.paginate) {
            const [data, total] = await this.accountRepository.findAndCount(options);
            return { data, total };
        } else {
            const data = await this.accountRepository.find(options);
            return { data, total: data.length };
        }
    }
}