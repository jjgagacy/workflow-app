'use client';

import { cn } from "@/utils/classnames";
import { treeToFlatten } from "@/utils/trees";
import { IconCaretUpDown, IconChevronDown, IconChevronRight, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { Checkbox } from "./checkbox";
import { useCustomTheme } from "../components/provider/customThemeProvider";
import { getThemeBgClass, getThemeHoverClass, ThemeType } from "@/types/theme";
import { some } from "lodash-es";

export type TreeNode = {
  [key: string]: any;
  id: string | number;
  label?: string;
  parent?: string | number | null;
  children?: TreeNode[];
}

type TreeSelectProps = {
  options: TreeNode[];
  selectedIdKey?: string | number | (string | number)[];
  idKey?: string;
  parentKey?: string;
  labelKey?: string;
  search?: boolean;
  multiple?: boolean;
  onChange?: (selected: TreeNode | (string | number)[] | any) => void;
}

export const TreeSelect: FC<TreeSelectProps> = ({
  options: treeData,
  selectedIdKey,
  idKey = 'id',
  parentKey = 'parent',
  labelKey = 'label',
  search = true,
  multiple = false,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [selectedLabel, setSelectedLabel] = useState("Please select...");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArr, setSelectedArr] = useState<(string | number)[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());
  const { activeTheme: activeTheme } = useCustomTheme();

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIdKey) {
      const flatNodes = treeToFlatten(treeData, { idKey, parentKey, labelKey });
      const selected = flatNodes.filter(node =>
        Array.isArray(selectedIdKey) ?
          selectedIdKey.includes(node[idKey]) :
          node[idKey] === selectedIdKey
      );

      if (selected.length > 0) {
        if (multiple) {
          const selectedIdKeys = selected.map(node => node[idKey]);
          setSelectedArr(selectedIdKeys);
          setSelectedLabel(
            treeToFlatten(treeData, { idKey, parentKey, labelKey })
              .filter(node => selectedIdKeys.includes(node[idKey]))
              .map(node => node[labelKey])
              .join(', ')
          );
        } else {
          const selectedLabels = selected.map(node => node[labelKey]);
          setSelectedValue(selectedIdKey as string | number);
          setSelectedLabel(selectedLabels[0]);
        }
      }
    }
  }, [selectedIdKey, treeData, idKey, parentKey, labelKey, multiple]);

  // 过滤数据
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return treeData;

    const floatNodes = treeToFlatten(treeData, { idKey, parentKey, labelKey });
    const matchedIds = new Set(
      floatNodes
        .filter(node => node[labelKey].toLowerCase.includes(term))
        .map(node => node[idKey])
    );

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map(node => ({ ...node }))
        .filter(node => {
          if (matchedIds.has(node[idKey])) return true;
          if (node.children) {
            node.children = filterTree(node.children);
            return node.children.length > 0;
          }
          return false;
        });
    }
    return filterTree([...treeData]);
  }, [searchTerm, treeData, idKey, labelKey, parentKey]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      if (selectedArr.length === 0 && !selectedValue) setSelectedLabel("Please select...");
    }
  }, [selectedArr, selectedValue]);

  // 辅助函数：根据 ID 查找节点
  const findNodeById = useCallback((nodes: TreeNode[], id: string | number): TreeNode | null => {
    for (const node of nodes) {
      if (node[idKey] === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, [idKey]);

  // 检查节点是否部分选中
  const isNodeIndeterminate = useCallback((node: TreeNode): boolean => {
    if (!node.children) return false;

    const hasSelectedChild = node.children.some(child =>
      selectedArr.includes(child[idKey]) || isNodeIndeterminate(child)
    );
    const hasUnselectedChild = node.children.some(child =>
      !selectedArr.includes(child[idKey]) && !isNodeIndeterminate(child)
    );
    return hasSelectedChild && hasUnselectedChild;
  }, [selectedArr, idKey]);

  // 选择节点
  const handleSelect = useCallback((node: TreeNode, checked?: boolean, e?: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发外层容器
    if (e) {
      e.stopPropagation();
    }
    // if (multiple && typeof checked === 'undefined') return;

    if (multiple) {
      const newSelected = new Set(selectedArr);
      let finalChecked: boolean;
      if (typeof checked !== 'undefined') {
        finalChecked = checked;
        // newSelected.add(node[idKey]);
      } else {
        // 点击父节点时，根据当前状态决定：如果全部选中则取消，否则全部选中
        const allChildrenSelected = getAllChildrenSelected(node);
        finalChecked = !allChildrenSelected;
        // if (allChildrenSelected) {
        //   newSelected.delete(node[idKey]);
        // } else {
        //   newSelected.add(node[idKey]);
        // }
        // newSelected.delete(node[idKey]);
      }

      // 递归处理当前节点及其所有子节点
      const processNode = (n: TreeNode) => {
        if (finalChecked) {
          newSelected.add(n[idKey]);
        } else {
          newSelected.delete(n[idKey]);
        }
        n.children?.forEach(processNode);
      };

      processNode(node);

      // 递归向上处理父节点（根据子节点状态更新父节点）
      const updateParentSelection = (n: TreeNode) => {
        const parent = findParentNode(treeData, n[idKey]);
        if (parent) {
          const allChildrenSelected = parent.children?.every(child => newSelected.has(child[idKey]));
          const someChildrenSelected = parent.children?.some(child => newSelected.has(child[idKey])) ?? false;
          if (allChildrenSelected) {
            newSelected.add(parent[idKey]);
          } else if (!someChildrenSelected) {
            newSelected.delete(parent[idKey]);
          }
          // 部分选中状态通过 indeterminate 处理，不修改 selected 状态
          updateParentSelection(parent);
        }
      }
      updateParentSelection(node);

      const newSelectedArr = Array.from(newSelected);
      setSelectedArr(newSelectedArr);
      setSelectedLabel(
        treeToFlatten(treeData, { idKey, parentKey, labelKey })
          .filter(n => newSelectedArr.includes(n[idKey]))
          .map(n => n[labelKey])
          .join(', ')
      );
      onChange?.(newSelectedArr);
    } else {
      setSelectedValue(node[idKey]);
      setSelectedLabel(node[labelKey]);
      onChange?.(node);
      setIsOpen(false);
    }
  }, [multiple, selectedArr, idKey, treeData, parentKey, labelKey, onChange]);

  // 检查节点是否被选中
  const isNodeSelected = useCallback((node: TreeNode): boolean => {
    if (multiple) {
      return selectedArr.includes(node[idKey]);
    }
    return node[idKey] === selectedValue;
  }, [selectedArr, selectedValue, multiple, idKey]);

  const getAllChildrenSelected = useCallback((node: TreeNode): boolean => {
    if (!node.children || node.children.length === 0) {
      return selectedArr.includes(node[idKey]);
    }
    return node.children.every(child => selectedArr.includes(child[idKey]) && getAllChildrenSelected(child));
  }, [selectedArr, idKey]);

  const findParentNode = useCallback((nodes: TreeNode[], childId: string | number): TreeNode | null => {
    for (const node of nodes) {
      if (node.children) {
        if (node.children.some(child => child[idKey] === childId)) {
          return node;
        }
        const found = findParentNode(node.children, childId);
        if (found) return found;
      }
    }
    return null;
  }, [idKey]);

  // 切换节点展开状态
  const toggleExpanded = useCallback((nodeId: string | number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    // 处理 indeterminate 状态
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      const nodeId = checkbox.id.replace('checkbox-', '');
      const node = findNodeById(treeData, nodeId);
      if (node) {
        (checkbox as HTMLInputElement).indeterminate = isNodeIndeterminate(node);
      }
    });
  }, [selectedArr, treeData, findNodeById, isNodeIndeterminate]);

  // 递归渲染树节点组件
  const TreeNode = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node[idKey]);
    const isChecked = isNodeSelected(node);
    const indeterminate = isNodeIndeterminate(node);
    // 计算是否全部子节点都被选中（用于父节点点击时的状态判断）
    const allChildrenSelected = hasChildren && node.children?.every(child => isNodeSelected(child));

    return (
      <div className="w-full">
        <div
          className={`flex w-full items-center py-1 px-2 ${getThemeHoverClass(activeTheme as ThemeType)} cursor-pointer ${selectedValue === node[idKey] ? `${getThemeBgClass(activeTheme as ThemeType)}` : ""
            }`}
          style={{ paddingLeft: `${level * 4 + 8}px` }}
          onClick={(e) => {
            if (hasChildren && multiple) {
              e.stopPropagation();
              handleSelect(node, !allChildrenSelected);
            } else {
              handleSelect(node);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpanded(node[idKey]);
          }}
        >
          {hasChildren ? (
            <span
              className="w-6 h-6 flex items-center justify-center mr-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node[idKey]);
              }}
            >
              {isExpanded ? (
                <IconChevronDown className="w-4 h-4 ml-2 opacity-50" />
              ) : (
                <IconChevronRight className="w-4 h-4 ml-2 opacity-50" />
              )}
            </span>
          ) : (
            <span className="w-4 h-4 mr-1"></span>
          )}

          {multiple && (
            <Checkbox
              type="checkbox"
              id={`checkbox-${node[idKey]}`}
              checked={isChecked}
              ref={(el) => {
                if (el) el.indeterminate = indeterminate;
              }}
              onChange={(e) => {
                e.stopPropagation();
                handleSelect(node, e.target.checked);
              }}
              className="mr-1"
            />
          )}
          <span>{node[labelKey]}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="pl-4">
            {node.children!.map((child) => (
              <TreeNode key={child[idKey]} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const clearSelection = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue("");
    setSelectedLabel("Please select...");
    setSelectedArr([]);
    onChange?.(null);
  }, [onChange]);

  return (
    <div className="relative" ref={selectRef}>
      {/* 模拟的 select 输入框 */}
      <div
        className="border border-[var(--border)] rounded-md px-3 py-2 w-full text-sm cursor-pointer flex items-center justify-between bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedLabel}</span>
        <div className="flex items-center">
          <IconX
            className="w-4 h-4 ml-2 opacity-50 hover:opacity-100"
            onClick={clearSelection}
          />
          <IconCaretUpDown className="w-4 h-4 ml-2 opacity-50" />
        </div>
      </div>

      {/* 下拉树形面板 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-[var(--border)] rounded-md shadow-lg bg-background max-h-60 overflow-auto">
          {/* 搜索框 */}
          {search && (
            <div className="sticky top-0 bg-background p-2 border-b border-[var(--border)]">
              <input
                type="text"
                className="w-full p-1 border border-[var(--border)] rounded-md text-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {/* 树形内容 */}
          <div className="p-1">
            {filteredData.map((node) => (
              <TreeNode key={node[idKey]} node={node} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}