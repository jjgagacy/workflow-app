import DepartmentForm from "./dep-form";

type DepartmentViewProps = {
  depKey: string;
};

export default async function DepartmentViewPage({
  depKey
}: DepartmentViewProps) {
  const pageTitle = depKey !== 'new' ? '编辑部门' : '添加部门';
  return <DepartmentForm depKey={depKey} pageTitle={pageTitle} />;
}
