import { Eye, Settings, Share } from "lucide-react"
import { Apps } from "../app.type"

export const AppListItem = ({ app, index, filteredApps }: { app: Apps, index: number, filteredApps: Apps[] }) => {
  const statusColors = {
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-gray-800 dark:text-text-secondary dark:border-[var(--border-light)]',
  }

  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  }

  return (
    <div className={`p-4 hover:bg-card transition-colors duration-200 ${index !== filteredApps.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2 rounded-lg ${iconColors[app.iconColor as keyof typeof iconColors]}`}>
            <app.icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-text-primary">{app.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[app.statusColor as keyof typeof statusColors]}`}>
                {app.statusText}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{app.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-card rounded-lg transition-colors">
              <Eye className="w-4 h-4 text-text-secondary" />
            </button>
            <button className="p-1.5 hover:bg-card rounded-lg transition-colors">
              <Share className="w-4 h-4 text-text-secondary" />
            </button>
            <button className="p-1.5 hover:bg-card rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}