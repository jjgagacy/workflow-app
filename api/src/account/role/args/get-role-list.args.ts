type GetRoleListArgs = Pagination & {
  id: number;
  key: string;
  name: string;
  parent: string;
  status: number;
  hasMenus?: boolean;
  hasRolePerms?: boolean;
  tenantId?: string;
};
