import { ExtendedTabOptions, Tabs } from "@/app/components/base/tabs";
import { NodeCatalog, NodeCategory, NodeCategoryType } from "../types";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { SearchInput } from "./search-input";
import { SearchResult } from "./searchResult";

interface NodeListPanelProps {
  nodes?: NodeCatalog[];
  onSelectNode?: (node: NodeCatalog) => void;
}

export const NodeListPanel = ({ nodes = [], onSelectNode }: NodeListPanelProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<NodeCategoryType>(NodeCategory.FLOW);
  const [searchValue, setSearchValue] = useState("");

  const tabOptions: Array<ExtendedTabOptions<NodeCategoryType>> = [
    {
      value: NodeCategory.FLOW,
      label: t('app.nodeCategory.flow'),
    },
    {
      value: NodeCategory.TOOLS,
      label: t('app.nodeCategory.tools'),
    },
    {
      value: NodeCategory.AI,
      label: t('app.nodeCategory.ai'),
    },
    {
      value: NodeCategory.CORE,
      label: t('app.nodeCategory.core'),
    },
  ];

  // 根据搜索词和当前 Tab 过滤节点
  const filteredNodes = useMemo(() => {
    if (!searchValue) {
      // 无搜索：显示当前 Tab 分类下的节点
      return nodes.filter(node => node.category === activeTab);
    }

    // 有搜索：显示所有分类中匹配搜索词的节点
    const lowerSearch = searchValue.toLowerCase();
    return nodes.filter(node =>
      node.name.toLowerCase().includes(lowerSearch) ||
      (node.description && node.description.toLowerCase().includes(lowerSearch))
    );
  }, [nodes, searchValue, activeTab]);

  // 按 section 分组
  const groupedNodes = useMemo(() => {
    const groups: Record<string, NodeCatalog[]> = {};
    filteredNodes.forEach(node => {
      const section = node.section || t('app.nodeCategory.uncategorized');
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(node);
    });
    return groups;
  }, [filteredNodes, t]);

  const hasSearch = searchValue.trim().length > 0;
  const hasResults = filteredNodes.length > 0;


  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <SearchInput
          placeholder={t('app.nodeList.searchPlaceholder') || "Search 9,000+ apps and tools..."}
          value={searchValue}
          onChange={setSearchValue}
          autoFocus
        />
      </div>
      {/* Tabs - 仅在无搜索时显示 */}
      {!hasSearch && (
        <div className="px-3 pt-2 border-b border-gray-200 dark:border-gray-700">
          <Tabs
            value={activeTab}
            options={tabOptions}
            onChange={(value) => setActiveTab(value)}
          />
        </div>
      )}
      {/* 结果区域 */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasResults ? (
          // 无结果展示
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              {/* 空状态图标 */}
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchValue ? t('app.nodeList.noSearchResults') : t('app.nodeList.noNodes')}
            </p>
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                {t('app.nodeList.clearSearch')}
              </button>
            )}
          </div>
        ) : (
          // 有结果：按分组展示
          <SearchResult groupedNodes={groupedNodes} onSelectNode={onSelectNode} />
        )}
      </div>

    </div>
  );
}