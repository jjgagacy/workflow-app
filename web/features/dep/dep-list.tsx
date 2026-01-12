import { columns } from "./components/columns";
import { Department } from "./components/data";
import { DepartmentTable } from "./components/dep-table";

export default async function DepartmentListPage() {
  const departments: Department[] = [];
  const totalItems = 0;

  return (
    <DepartmentTable
      data={departments}
      totalItems={totalItems}
      columns={columns}
    />
  );
}