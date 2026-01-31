import { MenuItem } from "@/types/menu";
import { Briefcase, Crown, Fingerprint, Home, LayoutDashboard, Sliders, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";

export function useMenus() {
  const { t } = useTranslation();

  const defaultMenuItems: MenuItem[] = [
    {
      key: 'dashboard',
      title: t('system.dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/workspace/dashboard"
    },
    {
      key: 'system',
      title: t('system.system_settings'),
      icon: <Sliders className="w-5 h-5" />,
      path: '/workspace/system',
      children: [
        { key: 'account', title: t('system.account'), icon: <UserCog className="w-5 h-5" />, path: "/workspace/system/account" },
        { key: 'dep', title: t('system.department'), icon: <Briefcase className="w-5 h-5" />, path: "/workspace/system/dep" },
        { key: 'role', title: t('system.role'), icon: <Crown className="w-5 h-5" />, path: "/workspace/system/role" },
        { key: 'module', title: t('system.permission_module'), icon: <Fingerprint className="w-5 h-5" />, path: "/workspace/system/module" },
        // { key: 'menu', title: t('system.menu'), icon: <List className="w-4 h-4" />, path: "/workspace/system/menu" },
      ]
    },
  ];

  return {
    defaultMenuItems
  }
}