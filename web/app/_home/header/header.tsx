'use client';

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "./logo";
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
import Navigation from "./navigation";
import Actions from "./actions";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
      : 'bg-transparent'
      }`
    }>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <Navigation />
          <Actions />
        </div>
      </div>
    </header>
  )
}