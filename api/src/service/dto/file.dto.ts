import { QueryDto } from "@/common/database/dto/query.dto";
import { CreatedRole } from "@/common/types/enums/role.enum";
import { StorageType } from "@/storage/types/storage.types";
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CommonUploadFileDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsUUID()
  tenantId: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  storageType: StorageType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mimeType?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  key: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  name: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  extension: string;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  size: number;
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  createdRole: CreatedRole;

  constructor(data?: Partial<CommonUploadFileDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class CreateUploadFileDto extends CommonUploadFileDto {
  @IsOptional()
  createdAccount?: number;
  @IsOptional()
  createdUser?: string;

  constructor(data?: Partial<CreateUploadFileDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class UpdateUploadFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  mimeType?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}

export class QueryUploadFileDto extends QueryDto {
  tenantId?: string;
  storageType?: StorageType;
  createdRole?: CreatedRole;
  createdAccount?: number;
  createdUser?: string;
  key?: string;
  name?: string;
  mimeType?: string;
  relations?: { tenant: boolean; createdAccount: boolean; };
  order?: { [P in 'createdAt']?: 'ASC' | 'DESC' }
}
