import { Eye, Settings, Share } from "lucide-react"
import { Apps } from "../app.type"

export const AppListItem = ({ app, index, filteredApps }: { app: Apps, index: number, filteredApps: Apps[] }) => {
  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${index !== filteredApps.length - 1 ? 'border-b border-gray-100' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2 rounded-lg bg-${app.iconColor}-50`}>
            <app.icon className={`w-5 h-5 text-${app.iconColor}-600`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900">{app.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border bg-${app.statusColor}-50 text-${app.statusColor}-700`}>
                {app.statusText}
              </span>
            </div>
            <p className="text-sm text-gray-500">{app.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Share className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}