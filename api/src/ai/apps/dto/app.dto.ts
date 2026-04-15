import { QueryDto } from "@/common/database/dto/query.dto";
import { IsNotEmpty } from "class-validator";
import { AppMode } from "../types/app.type";

export class QueryAppDto extends QueryDto {
  accountId?: number;
  tenantId?: string;
  name?: string;
  mode?: string;
  isPublic?: boolean;
  order?: { [P in 'createdAt' | 'name']?: 'ASC' | 'DESC' };
}

export class BaseAppDto {
  description?: string;
  icon?: string;
  iconType?: string;
  enableSite?: boolean;
  enableApi?: boolean;
  isPublic?: boolean;
  workflowId?: string;
}

export class CreateAppDto extends BaseAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  accountId!: number;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  tenantId!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name!: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  mode!: AppMode;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdBy!: string;
  createdAt?: Date;
}

export class UpdateAppDto extends BaseAppDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  updatedBy!: string;
  updatedAt?: Date;
}
