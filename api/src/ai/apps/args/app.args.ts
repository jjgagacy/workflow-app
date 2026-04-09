type GetAppListArgs = Pagination & {
  accountId?: number;
  tenantId?: string;
  name?: string;
  mode?: string;
  isPublic?: boolean;
};
