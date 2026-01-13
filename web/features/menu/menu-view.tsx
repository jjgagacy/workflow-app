import MenuForm from "./menu-form";

type MenuViewProps = {
  menuId: string;
}
export default async function MenuViewPage({
  menuId
}: MenuViewProps) {
  return <MenuForm menuId={menuId !== 'new' ? parseInt(menuId) : 0} />;
}