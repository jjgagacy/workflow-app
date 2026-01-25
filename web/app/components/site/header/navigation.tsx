'use client';

import { createNavigationData } from "../navItems";
import NavigationItem from "./navigationItem";
import { useTranslation } from "react-i18next";

export default function Navigation() {
  const { t } = useTranslation();
  // 顶部菜单数据
  const navItems = createNavigationData(t);

  return (
    <>
      <nav className="hidden md:flex items-center space-x-4">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
          >
            <NavigationItem item={item} />
          </div>
        ))}
      </nav>
    </>
  );
}
