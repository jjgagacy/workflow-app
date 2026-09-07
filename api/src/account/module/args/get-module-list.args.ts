type GetModuleListArgs = Pagination & {
  key: string;
  name: string;
  relations?: { perms: boolean, menus: boolean },
  tenantId?: string;
};

export default GetModuleListArgs;