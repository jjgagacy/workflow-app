export abstract class BaseAccountDto {
  id?: number;
  realName?: string;
  email?: string;
  mobile?: string;
  status?: number;
  roles?: number[];
}
