import MenuForm from "./menu-form";

type MenuViewProps = {
    menuId: string;
}
export default async function MenuViewPage({
    menuId
}: MenuViewProps) {
    const pageTitle = menuId !== 'new' ? '编辑菜单' : '添加菜单';

    return <MenuForm menuId={menuId !== 'new' ? parseInt(menuId) : 0} pageTitle={pageTitle} />;
}