'use client';

import { columns } from "./components/columns";
import { Module } from "./components/data";
import { ModuleTable } from "./components/module-table";

export default function ModuleListPage() {
  const modules: Module[] = [];
  const totalModules = 0;

  return (
    <ModuleTable
      data={modules}
      totalItems={totalModules}
      columns={columns}
    />
  );
}