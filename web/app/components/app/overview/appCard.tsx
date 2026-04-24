import { useState } from 'react';
import { MoreVertical, Database, Sparkles, Link2, Users, Clock, Star, StarOff, Eye, Share, Settings, BarChart3 } from "lucide-react";

// 应用卡片组件
export const AppCard = ({ app, onMenuClick }: { app: any; onMenuClick: (id: number) => void }) => {
  const Icon = app.icon;
  const [isStarred, setIsStarred] = useState(app.isStarred);

  const statusColors = {
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
  };

  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  };

  return (
    <div className="bg-card-light rounded-xl border border-[var(--border)] hover:shadow-lg transition-all duration-200 group">
      <div className="p-5">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${iconColors[app.iconColor]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-lg">{app.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[app.statusColor]}`}>
                  {app.statusText}
                </span>
                <span className="text-xs text-text-secondary">•</span>
                <span className="text-xs text-text-secondary">{app.type}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onMenuClick(app.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-card rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* 描述 */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">{app.description}</p>

        {/* 关联信息 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {app.knowledgeBases > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-primary bg-card border border-[var(--border-light)] px-2 py-1 rounded-md">
              <Database className="w-3 h-3" />
              <span>知识库({app.knowledgeBases})</span>
            </div>
          )}
          {app.dataTables > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-primary bg-card border border-[var(--border-light)] px-2 py-1 rounded-md">
              <Database className="w-3 h-3" />
              <span>数据表({app.dataTables})</span>
            </div>
          )}
          {app.mcpTools > 0 && (
            <div className="flex items-center gap-1 text-xs text-text-primary bg-card border border-[var(--border-light)] px-2 py-1 rounded-md">
              <Sparkles className="w-3 h-3" />
              <span>MCP工具({app.mcpTools})</span>
            </div>
          )}
          {app.embedAvailable && (
            <div className="flex items-center gap-1 text-xs text-text-primary bg-card border border-[var(--border-light)] px-2 py-1 rounded-md">
              <Link2 className="w-3 h-3" />
              <span>嵌入可用</span>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-3">
            {app.visits && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{app.visits}次访问</span>
              </div>
            )}
            {app.lastEdited && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{app.lastEdited}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsStarred(!isStarred)}
            className="hover:scale-110 transition-transform"
          >
            {isStarred ? (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-300" />
            )}
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
            <span>预览</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card rounded-lg transition-colors">
            <Share className="w-4 h-4" />
            <span>分享</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span>编辑</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:bg-card rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" />
            <span>数据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
