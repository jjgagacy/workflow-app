import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { NodeCatalog } from "../../types";
import { useTranslation } from "react-i18next";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { getCatalogNodeIconColor } from "../../utils/node";

interface SearchResultProps {
  groupedNodes: Record<string, NodeCatalog[]>;
  onSelectNode?: (node: NodeCatalog) => void;
}

export function SearchResult({ groupedNodes, onSelectNode }: SearchResultProps) {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  return (
    <div className="space-y-4">
      {Object.entries(groupedNodes).map(([sectionTitle, sectionNodes]) => (
        <div key={sectionTitle}>
          {/* 分组标题 */}
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
            {sectionTitle}
          </div>

          {/* 分组下的节点列表 */}
          <div className="space-y-1">
            {sectionNodes.map((node) => (
              <div
                key={node.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectNode?.(node)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${getThemeHoverClass(activeColorTheme as ThemeType)} transition-colors group`}
              >
                {/* 节点图标 */}
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-colors ${getCatalogNodeIconColor(node)}`} >
                  {
                    node.icon || (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )
                  }
                </div>

                {/* 节点信息 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {node.name}
                  </div>
                  {node.description && (
                    <div className="text-xs text-text-secondary truncate">
                      {node.description}
                    </div>
                  )}
                </div>

                {/* 右侧箭头 */}
                <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div >
      ))
      }
    </div >
  );
}