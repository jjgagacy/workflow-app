import { DEFAULT_MENU_ICON_CLASS_NAME, MenuItem, resolveMenuIconClassName } from "@/types/menu";
import { AppWindow, Briefcase, Crown, Fingerprint, GitBranch, LayoutDashboard, Library, Sliders, Table, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";

export const MENU_ICON_CLASS_NAME = DEFAULT_MENU_ICON_CLASS_NAME;

export function useMenus() {
  const { t } = useTranslation();

  const hiddenMenuRouteItems: MenuItem[] = [
    {
      key: 'dashboard',
      title: t('system.dashboard'),
      icon: LayoutDashboard,
      className: MENU_ICON_CLASS_NAME,
      path: "/workspace"
    },
  ];

  const defaultMenuItems: MenuItem[] = [
    {
      key: 'system',
      title: t('system.system_settings'),
      icon: Sliders,
      className: MENU_ICON_CLASS_NAME,
      path: '/workspace/system',
      children: [
        { key: 'account', title: t('system.account'), icon: UserCog, className: MENU_ICON_CLASS_NAME, path: "/system/account" },
        { key: 'dep', title: t('system.department'), icon: Briefcase, className: MENU_ICON_CLASS_NAME, path: "/system/dep" },
        { key: 'role', title: t('system.role'), icon: Crown, className: MENU_ICON_CLASS_NAME, path: "/system/role" },
        { key: 'module', title: t('system.permission_module'), icon: Fingerprint, className: MENU_ICON_CLASS_NAME, path: "/system/module" },
        // { key: 'menu', title: t('system.menu'), icon: List, className: MENU_ICON_CLASS_NAME, path: "/system/menu" },
      ]
    },
  ];

  const appMenuItems: MenuItem[] = [
    {
      key: 'app',
      title: t('system.app'),
      icon: AppWindow,
      className: MENU_ICON_CLASS_NAME,
      path: '/apps',
    },
    {
      key: 'workflow',
      title: t('system.workflow'),
      icon: GitBranch,
      className: MENU_ICON_CLASS_NAME,
      path: '/workflows',
    },
    {
      key: 'knowledge',
      title: t('system.knowledge'),
      icon: Library,
      className: MENU_ICON_CLASS_NAME,
      path: '/knowledges',
    },
    {
      key: 'table',
      title: t('system.table'),
      icon: Table,
      className: MENU_ICON_CLASS_NAME,
      path: '/tables',
    },
  ];

  return {
    defaultMenuItems,
    hiddenMenuRouteItems,
    appMenuItems,
    resolveMenuIconClassName,
  }
}