import { Grid, Loader2, Square, Zap } from "lucide-react";
import { SearchNavigate } from "./navigate";
import { SearchNoResult } from "./no-result";
import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeBgClass, getThemeHoverClass, ThemeType } from "@/types/theme";

// 搜索结果项类型定义
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon: 'zap' | 'square' | 'grid';
  updatedAt: string;
  category?: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  selectedIndex: number;
  index: number;
  handleSelectResult: (result: SearchResult) => void;
  setSelectedIndex: (index: number) => void;
}

// 图标组件映射
const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'zap':
      return <Zap className={`w-5 h-5 text-yellow-500 ${className}`} />;
    case 'square':
      return <Square className={`w-5 h-5 text-blue-500 ${className}`} />;
    case 'grid':
      return <Grid className={`w-5 h-5 text-purple-500 ${className}`} />;
    default:
      return <Zap className={`w-5 h-5 text-gray-400 ${className}`} />;
  }
};

export const SearchResultItem = ({ result, selectedIndex, index, handleSelectResult, setSelectedIndex }: SearchResultItemProps) => {
  const { activeColorTheme, darkmode } = useCustomTheme();
  return (
    <div
      key={result.id}
      className={`mx-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${getThemeHoverClass(activeColorTheme as ThemeType)} ${selectedIndex === index ? getThemeBgClass(activeColorTheme as ThemeType) : ''}`}
      onClick={() => handleSelectResult(result)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-8 h-8 bg-card border border-[var(--border-card)] rounded-lg flex items-center justify-center`}>
            <IconComponent icon={result.icon} />
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-text-primary truncate">
              {result.title}
            </h4>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {result.updatedAt}
            </span>
          </div>
          {result.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {result.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const SearchResult = ({ results, selectedIndex, handleSelectResult, setSelectedIndex, isLoading, resultsRef, value }: {
  results: SearchResult[];
  selectedIndex: number;
  handleSelectResult: (result: SearchResult) => void;
  setSelectedIndex: (index: number) => void;
  isLoading: boolean;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  value: string;
}) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden z-50">
      <div className="max-h-[400px] overflow-y-auto" ref={resultsRef}>
        {isLoading ? (
          // 加载状态
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            <p className="mt-3 text-sm text-gray-500">Searching...</p>
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <>
                {/* 最近更新标题 */}
                {value === '' && (
                  <div className="px-4 py-3 bg-background border-b border-[var(--border)]">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Recently updated
                    </h3>
                  </div>
                )}

                {/* 搜索结果列表 */}
                <div className="py-2">
                  {results.map((result, index) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      selectedIndex={selectedIndex}
                      index={index}
                      handleSelectResult={handleSelectResult}
                      setSelectedIndex={setSelectedIndex}
                    />
                  ))}
                </div>

                {/* 底部导航提示 */}
                <SearchNavigate />
              </>
            ) : (
              // 无结果状态
              <SearchNoResult />
            )}
          </>
        )}
      </div>
    </div>
  );
};