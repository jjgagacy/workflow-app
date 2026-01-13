import { Menu } from "./components/data";
import { MenuTable } from "./components/menu-table";

export default async function MenuListPage() {
  const menus: Menu[] = [];
  const totalMenus = 0;

  return (
    <MenuTable
      data={menus}
      totalItems={totalMenus}
    />
  )
}