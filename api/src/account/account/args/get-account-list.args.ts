type GetAccountListArgs = Pagination & {
  id: number;
  username: string;
  email: string;
  mobile: string;
  realName: string;
  status: number;
  roleId: number;
  relations: { roles: boolean; }
  tenantId: string;
};
