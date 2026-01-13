import DepartmentForm from "./dep-form";

type DepartmentViewProps = {
  depKey: string;
};

export default async function DepartmentViewPage({
  depKey
}: DepartmentViewProps) {
  return <DepartmentForm depKey={depKey} />;
}
