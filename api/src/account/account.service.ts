import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { EntityManager, FindManyOptions, FindOptionsOrder, FindOptionsWhere, Like, Repository } from "typeorm";
import { CreateAccountDto } from "./account/dto/create-account.dto";
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS, PASSWORD_SALT } from "@/config/constants";
import { RoleService } from "@/account/role.service";
import { plainToInstance } from "class-transformer";
import { UpdateAccountDto } from "./account/dto/update-account.dto";
import { QueryAccountDto } from "./account/dto/query-account.dto";
import { throwIfDtoValidateFail } from "@/common/utils/validation";
import { I18nService } from "nestjs-i18n";
import { InvalidInputGraphQLException } from "@/common/exceptions";
import { I18nTranslations } from "@/generated/i18n.generated";
import { MonieConfig } from "@/monie/monie.config";
import { getSafeTimezone } from "@/common/constants/timezone";
import { EditionType } from "@/monie/enums/version.enum";
import authConfig from "@/config/auth.config";
import { getPaginationOptions } from "@/common/database/dto/query.dto";
import { isPaginator } from "@/common/database/utils/pagination";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly roleService: RoleService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly monieConifg: MonieConfig,
  ) { }

  async getByUserName(username: string, roles: boolean = false): Promise<AccountEntity | null> {
    return await this.accountRepository.findOne({
      where: { username, },
      relations: { roles: roles }
    });
  }

  async getByEmail(email: string, roles: boolean = false): Promise<AccountEntity | null> {
    return await this.accountRepository.findOne({
      where: { email },
      relations: { roles: roles }
    });
  }

  async getById(id: number, roles: boolean = false): Promise<AccountEntity | null> {
    return await this.accountRepository.findOne({
      where: { id },
      relations: { roles }
    });
  }

  async create(dto: CreateAccountDto, entityManager?: EntityManager): Promise<AccountEntity> {
    const accountRepository = entityManager ?
      entityManager.getRepository(AccountEntity) : this.accountRepository;
    const validateObj = plainToInstance(CreateAccountDto, dto);
    const errors = await this.i18n.validate(validateObj);
    throwIfDtoValidateFail(errors);

    if (dto.username !== '') {
      const existingAccount = await this.getByUserName(dto.username!);
      if (existingAccount) {
        throw new BadRequestException(this.i18n.t('account.ACCOUNT_EXIST', { args: { name: dto.username } }));
      }
    }

    const edition = this.monieConifg.edition();
    if (edition === EditionType.SELF_HOSTED) {
      if (dto.username === '')
        throw new BadRequestException(this.i18n.t('system.EMPTY_PARAM', { args: { name: 'username' } }));
      if (dto.password === '')
        throw new BadRequestException(this.i18n.t('account.PASSWORD_NOT_EMPTY'));

    } else if (edition === EditionType.CLOUD) {
      if (dto.email === '')
        throw new BadRequestException(this.i18n.t('account.EMAIL_NOT_EMPTY'));
      const existingAccount = await this.getByEmail(dto.email || '');
      if (existingAccount) {
        throw new BadRequestException(this.i18n.t('account.EMAIL_EXIST', { args: { name: dto.email } }));
      }
    }

    if (dto.password != '') {
      this.validPassword(dto.password);
    }

    const salt = dto.password !== '' ? await this.generateSaltString() : '';
    const accountEntity = this.accountRepository.create({
      ...this.mapBaseFields(validateObj),
      salt,
      password: dto.password !== '' ? await this.hashPassword(dto.password, salt) : '',
      operate: this.mapOperateFields(validateObj),
      roles: await this.roleService.resolveRoles(dto.roles)
    });

    await accountRepository.save(accountEntity);
    return accountEntity;
  }

  async update(dto: UpdateAccountDto): Promise<AccountEntity | null> {
    const validateObj = plainToInstance(UpdateAccountDto, dto);
    const errors = await this.i18n.validate(validateObj);
    throwIfDtoValidateFail(errors);
    if (dto.id === undefined) {
      throw new InvalidInputGraphQLException(this.i18n.t('system.INVALID_PARAM', { args: { name: 'id', value: dto.id } }));
    }
    const account = await this.getById(dto.id);
    if (!account) {
      throw new InvalidInputGraphQLException(this.i18n.t('account.ACCOUNT_ID_NOT_EXISTS'));
    }
    if (dto.username && dto.username !== account.username) {
      const accountWithSameUsername = await this.getByUserName(dto.username);
      if (accountWithSameUsername) {
        throw new BadRequestException(this.i18n.t('account.ACCOUNT_EXIST', { args: { name: dto.username } }))
      }
    }

    const updatedFields = {
      ...this.mapBaseFields(dto),
      operate: this.mapOperateFields(dto),
    };

    if (dto.password) {
      this.validPassword(dto.password);
      const salt = await this.generateSaltString();
      updatedFields.password = await this.hashPassword(dto.password, salt);
      updatedFields.salt = salt;
    }

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
      throw new InvalidInputGraphQLException(this.i18n.t('account.ACCOUNT_ID_NOT_EXISTS'));
    }
    await this.accountRepository.delete(id);
  }

  private mapBaseFields(dto: CreateAccountDto | UpdateAccountDto): Partial<AccountEntity> {
    return {
      username: dto.username,
      realName: dto.realName,
      email: dto.email,
      avatar: dto.avatar,
      mobile: dto.mobile,
      status: dto.status,
      prefer_language: dto.language,
      theme: dto.theme,
      ...(dto.language && { timezone: getSafeTimezone(dto.language || '') }),
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

  private async hashPassword(password: string, salt: string = ''): Promise<string> {
    return bcrypt.hash(password, salt ?? PASSWORD_SALT);
  }

  private getSaltRounds(): number {
    return BCRYPT_SALT_ROUNDS;
  }

  async generateSaltString(): Promise<string> {
    return bcrypt.genSalt(this.getSaltRounds());
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
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
      ...{ tenant: { id: dto.tenantId } },
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
      ...(getPaginationOptions(dto))
    };

    // 执行查询
    if (isPaginator(dto)) {
      const [data, total] = await this.accountRepository.findAndCount(options);
      return { data, total };
    } else {
      const data = await this.accountRepository.find(options);
      return { data, total: data.length };
    }
  }

  async toggleStatus(dto: UpdateAccountDto): Promise<void> {
    const accountId = dto.id;
    if (!accountId) {
      throw new InvalidInputGraphQLException(this.i18n.t('system.INVALID_PARAM', { args: { name: 'id', alue: dto.id } }))
    }
    const existingAccount = await this.getById(accountId);
    if (!existingAccount) {
      throw new InvalidInputGraphQLException(this.i18n.t('account.ACCOUNT_ID_NOT_EXISTS'));
    }
    const newStatus = existingAccount.status === 1 ? 0 : 1;
    const updateFields = {
      status: newStatus,
      operate: this.mapOperateFields(dto),
    };
    await this.accountRepository.update(accountId, updateFields);
  }

  validPassword(password: string): string {
    const passwordPattern = authConfig().passwordPattern;
    if (passwordPattern.test(password)) {
      return password;
    }
    throw new InvalidInputGraphQLException(this.i18n.t('auth.PASSWORD_VALIDATE_ERROR'));
  }

  async validateSignupUsername(username: string): Promise<UsernameValidationResult> {
    if (username.length < 2 || username.length > 20) {
      return {
        valid: false,
        error: this.i18n.t('auth.USERNAME_VALIDATE_LENGTH', { args: { minLength: 2, maxLength: 20 } }),
      };
    }

    // Regular expression: Supports Chinese, English, numbers and underscores
    // Chinese unicode range: \u4e00-\u9fa
    // English (uppercase and lowercase) a-zA-Z
    // Numbers: 0-9
    // Underscore: _
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return {
        valid: false,
        error: this.i18n.t('auth.USERNAME_INVALID_CHARS'),
      }
    }

    const usernameExisting = await this.getByUserName(username);
    if (usernameExisting) {
      return {
        valid: false,
        error: this.i18n.t('account.ACCOUNT_EXIST', { args: { name: username } }),
      }
    }

    return { valid: true };
  }
}

interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

