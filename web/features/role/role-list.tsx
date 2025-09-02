'use client';

import { Role } from "@/types/role";
import { columns } from "./components/columns";
import { RoleTable } from "./components/role-table";

export default function RoleListPage() {
    const roles: Role[] = [];
    const totalRoles = 0;

    return (
        <RoleTable
            data={roles}
            totalItems={totalRoles}
            columns={columns}
        />
    );
}