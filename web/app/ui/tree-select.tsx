'use client';

import { cn } from "@/utils/classnames";
import { treeToFlatten } from "@/utils/trees";
import { IconCaretUpDown, IconChevronDown, IconChevronRight, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";

export type TreeNode = {
    [key: string]: any;
    id: string | number;
    label?: string;
    parent?: string | number | null;
    children?: TreeNode[];
}

export type ITreeSelectProps = {
    options: TreeNode[];
    selectedIdKey?: string | number | (string | number)[];
    idKey?: string;
    parentKey?: string;
    labelKey?: string;
    search?: boolean;
    multiple?: boolean;
    onChange?: (selected: TreeNode | (string | number)[] | null) => void;
}

export const TreeSelect: FC<ITreeSelectProps> = ({ 
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
    const [selectedLabel, setSelectedLabel] = useState("请选择...");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedArr, setSelectedArr] = useState<(string | number)[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());

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
            if (selectedArr.length === 0) setSelectedLabel("请选择...");
        }
    }, [selectedArr]);

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
    const handleSelect = useCallback((node: TreeNode, checked?: boolean) => {
        if (multiple && typeof checked === 'undefined') return;

        if (multiple) {
            const newSelected = new Set(selectedArr);
            if (checked) {
                newSelected.add(node[idKey]);
            } else {
                newSelected.delete(node[idKey]);
            }
            // 递归处理子节点
            const processChildren = (n: TreeNode) => {
                if (checked) {
                    newSelected.add(n[idKey]);
                } else {
                    newSelected.delete(n[idKey]);
                }
                n.children?.forEach(processChildren);
            };
            node.children?.forEach(processChildren);

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

        return (
            <div className="w-full">
                <div
                    className={`flex items-center py-1 px-2 hover:bg-selection-hover cursor-pointer ${selectedValue === node[idKey] ? "bg-blue-50" : ""
                        }`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => handleSelect(node)}
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
                        <input
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
                            className="w-4 h-4 mr-1 rounded-md focus:ring-blue-500"
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
        setSelectedLabel("请选择...");
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
                                placeholder="搜索..."
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