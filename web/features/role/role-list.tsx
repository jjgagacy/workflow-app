import { Role } from "@/types/role";
import { RoleTable } from "./components/role-table";

export default function RoleListPage() {
  const roles: Role[] = [];
  const totalRoles = 0;

  return (
    <RoleTable
      data={roles}
      totalItems={totalRoles}
    />
  );
}
