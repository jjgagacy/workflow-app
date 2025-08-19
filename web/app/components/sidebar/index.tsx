'use client';

import { Icon360View, IconMenu2 } from "@tabler/icons-react";
import { ReactNode } from "react";

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: (data: boolean) => void;
    children: ReactNode;
}

export function Sidebar({ collapsed, onToggleCollapse, children}: SidebarProps) {
    return (
        <aside className="fixed left-0 top-0 h-screen">
            <div className="flex relative bg-gray-100 flex-col">
                <div
                    className={`bg-white dark:bg-black h-screen shadow-md transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
                        }`}
                >
                    {/* Header with logo and collapse button */}
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4  border-b border-[var(--border)] shrink-0 h-[3rem]`}>
                        {!collapsed && <Icon360View className="w-6 h-6 text-blue-700" />}
                        <button
                            onClick={() => onToggleCollapse(!collapsed)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <IconMenu2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation content area */}
                    <div className="flex-1 h-[calc(100vh-3rem)] relative py-2 overflow-y-auto no-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </aside>
    );
}