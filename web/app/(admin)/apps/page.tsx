'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Settings,
  Bot,
  Workflow,
  Sparkles,
  Database,
  Share,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react';
import { StatCard } from '@/app/components/app/overview/statCard';
import { AppCard } from '@/app/components/app/overview/appCard';
import Button from '@/app/components/base/button';
import { AppListItem } from '@/app/components/app/overview/appListItem';
import { Apps } from '@/app/components/app/app.type';
import { Input } from '@/app/ui/input';
import { FilterMenu } from '@/app/components/app/overview/filter-menu';

// 应用数据示例
const applications: Array<Apps> = [
  {
    id: 1,
    name: '智能客服助手',
    type: 'Chatbot',
    status: 'published',
    statusText: '已发布',
    statusColor: 'green',
    icon: Bot,
    iconColor: 'blue',
    knowledgeBases: 2,
    visits: '1.2k',
    lastEdited: null,
    embedAvailable: true,
    isStarred: true,
    description: '7x24小时智能客服，自动回答常见问题'
  },
  {
    id: 2,
    name: '销售分析助手',
    type: '工作流应用',
    status: 'draft',
    statusText: '草稿',
    statusColor: 'yellow',
    icon: Workflow,
    iconColor: 'purple',
    knowledgeBases: 0,
    dataTables: 1,
    visits: null,
    lastEdited: '2小时前',
    embedAvailable: false,
    isStarred: false,
    description: '自动分析销售数据，生成周报月报'
  },
  {
    id: 3,
    name: '法务审核应用',
    type: 'Agent',
    status: 'shared',
    statusText: '已分享',
    statusColor: 'blue',
    icon: Sparkles,
    iconColor: 'indigo',
    knowledgeBases: 0,
    mcpTools: 1,
    visits: '3.4k',
    lastEdited: null,
    embedAvailable: true,
    isStarred: true,
    description: '智能审核合同条款，识别法律风险'
  },
  {
    id: 4,
    name: '文档处理工作流',
    type: '工作流应用',
    status: 'published',
    statusText: '已发布',
    statusColor: 'green',
    icon: Workflow,
    iconColor: 'orange',
    knowledgeBases: 1,
    visits: '856',
    lastEdited: null,
    embedAvailable: true,
    isStarred: false,
    description: '自动处理文档OCR、分类和归档'
  },
  {
    id: 5,
    name: '数据分析Agent',
    type: 'Agent',
    status: 'draft',
    statusText: '草稿',
    statusColor: 'yellow',
    icon: Sparkles,
    iconColor: 'green',
    knowledgeBases: 0,
    dataTables: 2,
    visits: null,
    lastEdited: '1天前',
    embedAvailable: false,
    isStarred: false,
    description: '智能数据分析与可视化助手'
  },
  {
    id: 6,
    name: '知识库问答',
    type: 'Chatbot',
    status: 'published',
    statusText: '已发布',
    statusColor: 'green',
    icon: Bot,
    iconColor: 'cyan',
    knowledgeBases: 3,
    visits: '5.2k',
    lastEdited: null,
    embedAvailable: true,
    isStarred: true,
    description: '基于企业内部知识库的智能问答系统'
  }
];

// 主组件
const Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' ||
      (selectedType === 'chatbot' && app.type === 'Chatbot') ||
      (selectedType === 'workflow' && app.type === '工作流应用') ||
      (selectedType === 'agent' && app.type === 'Agent');
    return matchesSearch && matchesType;
  });

  const stats = {
    total: applications.length,
    chatbot: applications.filter(a => a.type === 'Chatbot').length,
    workflow: applications.filter(a => a.type === '工作流应用').length,
    agent: applications.filter(a => a.type === 'Agent').length
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="bg-background border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <button className="px-3 py-1.5 text-sm font-medium text-text-primary bg-card rounded-lg">
                  📋 我的应用
                </button>
                <button className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-card rounded-lg transition-colors">
                  🛒 应用市场
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant={'primary'} size={'large'} onClick={() => console.log('Import clicked')}>
                <Plus className="w-4 h-4" />
                <span>创建应用</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Database} title="全部" value={`${stats.total} 个应用`} color="blue" />
          <StatCard icon={Bot} title="Chatbot" value={`${stats.chatbot} 个`} color="green" />
          <StatCard icon={Workflow} title="工作流型" value={`${stats.workflow} 个`} color="purple" />
        </div>

        {/* 搜索和操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索应用..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FilterMenu />
            </div>
            <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg bg-card p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-card text-text-secondary' : 'text-text-secondary/50'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-card text-text-secondary' : 'text-text-secondary/50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 应用列表 */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <AppCard key={app.id} app={app} onMenuClick={(id) => console.log('Menu clicked for app', id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200">
            {filteredApps.map((app, index) => (
              <AppListItem
                key={app.id}
                app={app}
                filteredApps={filteredApps}
                index={index}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-text-primary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">未找到应用</h3>
            <p className="text-text-secondary">尝试调整搜索关键词或筛选条件</p>
          </div>
        )}

        {/* 分页 */}
        {filteredApps.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-text-secondary">
              显示 {filteredApps.length} 个应用，共 {applications.length} 个
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-text-secondary hover:bg-card disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-text-secondary hover:bg-card">2</button>
              <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-text-secondary hover:bg-card">3</button>
              <button className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-text-secondary hover:bg-card">
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;