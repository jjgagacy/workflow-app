import { QueryDto } from "@/common/database/dto/query.dto";
import { IsNotEmpty } from "class-validator";

export class QueryInstalledAppDto extends QueryDto {
  accountId?: number;
  tenantId?: string;
  appId?: string;
  isPinned?: boolean;
  order?: { [P in 'createdAt' | 'lastUsedAt']?: 'ASC' | 'DESC' };
}

export class BaseInstalledAppDto {
  isPinned?: boolean;
}

export class CreateInstalledAppDto extends BaseInstalledAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  ownerTenantId!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  appId!: string;
  createdAt?: Date;
}

export class UpdateInstalledAppDto extends BaseInstalledAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy!: string;
  updatedAt?: Date;
}
