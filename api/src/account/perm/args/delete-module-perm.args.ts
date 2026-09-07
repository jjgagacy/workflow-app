import CreateModulePermArgs from "./create-module-perm.args";

type DeleteModulePermArgs = Pick<CreateModulePermArgs, 'module' | 'key' | 'tenantId'>;

export default DeleteModulePermArgs;