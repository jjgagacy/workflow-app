'use client';

import { IconMenu2 } from "@tabler/icons-react";
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
                    className={`bg-white h-screen shadow-md transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
                        }`}
                >
                    {/* Header with logo and collapse button */}
                    <div className="flex items-center justify-between p-4 border-b shrink-0 h-[3rem]">
                        {!collapsed && <h1 className="text-xl font-bold">管理后台</h1>}
                        <button
                            onClick={() => onToggleCollapse(!collapsed)}
                            className="p-2 rounded-full hover:bg-gray-200"
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