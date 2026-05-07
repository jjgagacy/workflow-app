import { MenuItem } from "@/types/menu";
import { AppWindow, Briefcase, Crown, Fingerprint, GitBranch, LayoutDashboard, Library, Sliders, Table, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";

export function useMenus() {
  const { t } = useTranslation();

  const hiddenMenuRouteItems: MenuItem[] = [
    {
      key: 'dashboard',
      title: t('system.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/workspace"
    },
  ];

  const defaultMenuItems: MenuItem[] = [
    {
      key: 'system',
      title: t('system.system_settings'),
      icon: <Sliders className="w-5 h-5" />,
      path: '/workspace/system',
      children: [
        { key: 'account', title: t('system.account'), icon: <UserCog className="w-5 h-5" />, path: "/system/account" },
        { key: 'dep', title: t('system.department'), icon: <Briefcase className="w-5 h-5" />, path: "/system/dep" },
        { key: 'role', title: t('system.role'), icon: <Crown className="w-5 h-5" />, path: "/system/role" },
        { key: 'module', title: t('system.permission_module'), icon: <Fingerprint className="w-5 h-5" />, path: "/system/module" },
        // { key: 'menu', title: t('system.menu'), icon: <List className="w-4 h-4" />, path: "/system/menu" },
      ]
    },
  ];

  const appMenuItems: MenuItem[] = [
    {
      key: 'app',
      title: t('system.app'),
      icon: <AppWindow className="w-5 h-5" />,
      path: '/apps',
    },
    {
      key: 'workflow',
      title: t('system.workflow'),
      icon: <GitBranch className="w-5 h-5" />,
      path: '/workflows',
    },
    {
      key: 'knowledge',
      title: t('system.knowledge'),
      icon: <Library className="w-5 h-5" />,
      path: '/knowledges',
    },
    {
      key: 'table',
      title: t('system.table'),
      icon: <Table className="w-5 h-5" />,
      path: '/tables',
    },
  ];

  return {
    defaultMenuItems,
    hiddenMenuRouteItems,
    appMenuItems,
  }
}