'use client';

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  ChevronDown,
  Zap,
  Workflow,
  Brain,
  Bot,
  MessageSquare,
  Palette,
  Download,
  FileText,
  Users,
  CreditCard,
  BookOpen,
  Smartphone,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
  BarChart,
  Cloud,
  Lock,
  Server,
  Code,
  Package,
  Layers,
  Cpu
} from "lucide-react";
import NavigationItem from "./navigationItem";
import { createNavigationData } from "../navItems";

export default function Navigation() {
  const { t, i18n } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 顶部菜单数据
  const navItems = createNavigationData(t);

  return (
    <>
      <nav className="hidden md:flex items-center space-x-8">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <NavigationItem item={item} />
          </div>
        ))}
      </nav>
    </>
  );
}
