// constants/navigation.ts
import {
  Bot, MessageSquare, Palette, BarChart, Workflow, Zap,
  Layers, Cpu, Sparkles, Brain, Lock, Server, Code,
  Cloud, Package, BookOpen, Users,
  Home,
  LogIn,
  UserPlus
} from 'lucide-react';

// 定义类型
export interface NavSubItem {
  text: string;
  icon: React.ReactNode;
  href: string;
}

export interface NavDropdownColumn {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: NavSubItem[];
}

export interface NavItem {
  label: string;
  href: string;
  dropdown?: NavDropdownColumn[];
}

// 创建导航数据的工厂函数
export function createNavigationData(t: (key: string) => string): NavItem[] {
  return [
    {
      label: t('home.nav.products'),
      href: '#',
      dropdown: [
        {
          title: t('home.nav.agents'),
          description: t('home.nav.agents_desc'),
          icon: <Bot className="w-6 h-6" />,
          items: [
            { text: t('home.nav.ai_agents'), icon: <MessageSquare className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.creative_agents'), icon: <Palette className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.analytics_agents'), icon: <BarChart className="w-4 h-4" />, href: '#' }
          ]
        },
        {
          title: t('home.nav.workflows'),
          description: t('home.nav.workflows_desc'),
          icon: <Workflow className="w-6 h-6" />,
          items: [
            { text: t('home.nav.automation'), icon: <Zap className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.data_processing'), icon: <Layers className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.model_orchestration'), icon: <Cpu className="w-4 h-4" />, href: '#' }
          ]
        },
        {
          title: t('home.nav.features'),
          description: t('home.nav.features_desc'),
          icon: <Sparkles className="w-6 h-6" />,
          items: [
            { text: t('home.nav.visual_editor'), icon: <Palette className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.multi_model'), icon: <Brain className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.private_deployment'), icon: <Lock className="w-4 h-4" />, href: '#' }
          ]
        }
      ]
    },
    {
      label: t('home.nav.solutions'),
      href: '#',
      dropdown: [
        {
          title: t('home.nav.enterprise_solutions'),
          description: t('home.nav.enterprise_solutions_desc'),
          icon: <Server className="w-6 h-6" />,
          items: [
            { text: t('home.nav.customer_service'), icon: <MessageSquare className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.data_analytics'), icon: <BarChart className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.office_automation'), icon: <Zap className="w-4 h-4" />, href: '#' }
          ]
        },
        {
          title: t('home.nav.developer_tools'),
          description: t('home.nav.developer_tools_desc'),
          icon: <Code className="w-6 h-6" />,
          items: [
            { text: t('home.nav.api_integration'), icon: <Cloud className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.sdk'), icon: <Package className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.documentation'), icon: <BookOpen className="w-4 h-4" />, href: '#' }
          ]
        },
        {
          title: t('home.nav.personal_creation'),
          description: t('home.nav.personal_creation_desc'),
          icon: <Users className="w-6 h-6" />,
          items: [
            { text: t('home.nav.content_generation'), icon: <Palette className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.creative_assistant'), icon: <Sparkles className="w-4 h-4" />, href: '#' },
            { text: t('home.nav.learning_partner'), icon: <BookOpen className="w-4 h-4" />, href: '#' }
          ]
        }
      ]
    },
    { label: t('home.nav.pricing'), href: '#' },
    { label: t('home.nav.docs'), href: '#' },
    { label: t('home.nav.blog'), href: '#' },
  ];
}

// 移动端菜单数据工厂函数
export function createMobileMenuData(t: (key: string) => string) {
  return [
    ...createNavigationData(t),
  ];
}