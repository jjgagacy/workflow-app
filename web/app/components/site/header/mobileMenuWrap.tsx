'use client';

import { useTranslation } from "react-i18next";
import MobileMenu from "./mobileMenu";
import { useEffect, useState } from "react";
import { useMobileMenu } from "@/context/mobileMenuContext";
import { createMobileMenuData } from "../navItems";

export default function MobileMenuWrap() {
  const { t, i18n } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpanded = (itemLabel: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedItems(new Set());
  };

  // 阻止 body 滚动当菜单打开时
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const mobileMenuItems = createMobileMenuData(t);

  return (
    <>
      {/* 移动端菜单 */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        menuItems={mobileMenuItems}
        expandedItems={expandedItems}
        toggleItemExpanded={toggleItemExpanded}
        t={t}
      />
    </>
  );
}