// app/components/site/header/navigation-item.tsx
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { NavItem } from "../navItems";

interface NavigationItemProps {
  item: NavItem;
}

export default function NavigationItem({ item }: NavigationItemProps) {
  if (!item.dropdown) {
    return (
      <Link
        href={item.href}
        className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        {item.label}
      </Link>
    );
  }

  // 为每个下拉菜单生成唯一的ID
  const dropdownId = `dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
  const buttonId = `button-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className="relative"
      data-dropdown-trigger
      data-dropdown-id={dropdownId}
      data-button-id={buttonId}
      data-hover-delay="200"
      data-leave-delay="150"
    >
      {/* 触发按钮 - 移除所有事件处理器 */}
      <button
        id={buttonId}
        type="button"
        className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors font-medium cursor-pointer dropdown-trigger"
        aria-expanded="false"
        aria-controls={dropdownId}
        aria-haspopup="true"
      // 基础交互将由JavaScript处理
      >
        <span>{item.label}</span>
        <ChevronDown className="w-4 h-4 transition-transform duration-200 dropdown-chevron" />
      </button>

      {/* 下拉菜单 - 完整内容在服务端渲染，但默认隐藏 */}
      <div
        id={dropdownId}
        data-dropdown
        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 md:w-[600px] lg:w-[800px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 hidden dropdown-content"
        aria-hidden="true"
        role="menu"
      >
        <div className="p-6">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {item.dropdown.map((column, idx) => (
              <div key={idx} className="space-y-4">
                {/* 列标题 */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    {column.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {column.description}
                    </p>
                  </div>
                </div>

                {/* 子项列表 */}
                <ul className="space-y-2">
                  {column.items.map((subItem, subIdx) => (
                    <li key={subIdx}>
                      <Link
                        href={subItem.href || "#"}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group menu-item"
                        role="menuitem"
                        tabIndex={-1} // JavaScript激活后会设置正确的tabindex
                        prefetch={false}
                      >
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          {subItem.icon}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {subItem.text}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}