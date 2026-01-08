type CreateModulePermArgs = {
  tenantId: string;

  module: string;
  // module perm key
  key: string;
  // module perm name
  name: string;
  // module perm restrictLevel
  restrictLevel?: number;
};
