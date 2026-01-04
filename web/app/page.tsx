'use client';

import useTheme from "@/hooks/use-theme";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useActiveTheme } from "./components/active-theme";
import { useEffect, useState } from "react";
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
import Header from "./_home/header/header";

export default function Home() {
  const { t, i18n } = useTranslation();
  const { activeTheme: theme, setActiveTheme: setTheme } = useActiveTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  // 功能特性数据
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: t('home.nav.features.multi_model_agents.title'),
      description: t('home.nav.features.multi_model_agents.description'),
      highlights: [
        t('home.nav.features.multi_model_agents.highlights.intelligent_dialogue'),
        t('home.nav.features.multi_model_agents.highlights.content_creation'),
        t('home.nav.features.multi_model_agents.highlights.code_generation')
      ]
    },
    {
      icon: <Workflow className="w-12 h-12 text-purple-500" />,
      title: t('home.nav.features.visual_workflow.title'),
      description: t('home.nav.features.visual_workflow.description'),
      highlights: [
        t('home.nav.features.visual_workflow.highlights.automation'),
        t('home.nav.features.visual_workflow.highlights.data_processing'),
        t('home.nav.features.visual_workflow.highlights.report_generation')
      ]
    },
    {
      icon: <Zap className="w-12 h-12 text-green-500" />,
      title: t('home.nav.features.task_automation.title'),
      description: t('home.nav.features.task_automation.description'),
      highlights: [
        t('home.nav.features.task_automation.highlights.intelligent_scheduling'),
        t('home.nav.features.task_automation.highlights.conditional_triggers'),
        t('home.nav.features.task_automation.highlights.batch_processing')
      ]
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      title: t('home.nav.features.creative_generation.title'),
      description: t('home.nav.features.creative_generation.description'),
      highlights: [
        t('home.nav.features.creative_generation.highlights.ai_drawing'),
        t('home.nav.features.creative_generation.highlights.video_generation'),
        t('home.nav.features.creative_generation.highlights.website_creation')
      ]
    }
  ];

  // 为什么选择 Monie 的理由
  const whyChooseMonie = [
    {
      icon: <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: t('home.nav.why_choose.low_threshold.title'),
      description: t('home.nav.why_choose.low_threshold.description')
    },
    {
      icon: <Workflow className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: t('home.nav.why_choose.high_scalability.title'),
      description: t('home.nav.why_choose.high_scalability.description')
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: t('home.nav.why_choose.private_deployment.title'),
      description: t('home.nav.why_choose.private_deployment.description')
    },
    {
      icon: <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: t('home.nav.why_choose.community_sharing.title'),
      description: t('home.nav.why_choose.community_sharing.description')
    }
  ];

  // 应用场景
  const useCases = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: t('home.nav.use_cases.intelligent_dialogue.title'),
      description: t('home.nav.use_cases.intelligent_dialogue.description')
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: t('home.nav.use_cases.creative_generation.title'),
      description: t('home.nav.use_cases.creative_generation.description')
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />,
      title: t('home.nav.use_cases.task_automation.title'),
      description: t('home.nav.use_cases.task_automation.description')
    },
    {
      icon: <Bot className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
      title: t('home.nav.use_cases.app_factory.title'),
      description: t('home.nav.use_cases.app_factory.description')
    }
  ];

  // Footer 链接数据
  const footerLinks = {
    product: [
      { label: t('home.nav.footer.product.agent_platform'), href: "#" },
      { label: t('home.nav.footer.product.workflow_engine'), href: "#" },
      { label: t('home.nav.footer.product.api'), href: "#" },
      { label: t('home.nav.footer.product.app_store'), href: "#" }
    ],
    solutions: [
      { label: t('home.nav.footer.solutions.enterprise'), href: "#" },
      { label: t('home.nav.footer.solutions.developer_tools'), href: "#" },
      { label: t('home.nav.footer.solutions.education'), href: "#" },
      { label: t('home.nav.footer.solutions.startups'), href: "#" }
    ],
    resources: [
      { label: t('home.nav.footer.resources.docs'), href: "#" },
      { label: t('home.nav.footer.resources.blog'), href: "#" },
      { label: t('home.nav.footer.resources.tutorials'), href: "#" },
      { label: t('home.nav.footer.resources.api_reference'), href: "#" }
    ],
    company: [
      { label: t('home.nav.footer.company.about'), href: "#" },
      { label: t('home.nav.footer.company.careers'), href: "#" },
      { label: t('home.nav.footer.company.contact'), href: "#" },
      { label: t('home.nav.footer.company.media'), href: "#" }
    ],
    legal: [
      { label: t('home.nav.footer.legal.terms'), href: "#" },
      { label: t('home.nav.footer.legal.privacy'), href: "#" },
      { label: t('home.nav.footer.legal.agreement'), href: "#" },
      { label: t('home.nav.footer.legal.cookie'), href: "#" }
    ]
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <Header />
      </div>
    </>
  );
}
