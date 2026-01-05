import { ChevronDown, X } from "lucide-react";
import Link from "next/link";

// 移动端菜单组件
export default function MobileMenu({
  isOpen,
  onClose,
  menuItems,
  expandedItems,
  toggleItemExpanded,
  t
}: {
  isOpen: boolean;
  onClose: () => void;
  menuItems: any[];
  expandedItems: Set<string>;
  toggleItemExpanded: (label: string) => void;
  t: any;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      {/* 菜单面板 */}
      <div className="
        fixed top-0 right-0 bottom-0 
        w-full 
        bg-white dark:bg-gray-900 
        shadow-2xl z-50 
        md:hidden
        animate-[slideInFromRight_0.3s_ease-out]
        overflow-y-auto
      ">
        {/* 标题栏 */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.common.nav_title')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('app.action.close')}
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* 菜单内容 */}
        <div className="p-4">
          {/* 一级菜单项 */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.label} className="mb-1">
                {/* 没有下拉菜单的项 */}
                {!item.dropdown ? (
                  <Link
                    href={item.href}
                    className="
                      flex items-center justify-between
                      px-4 py-4
                      text-gray-800 dark:text-gray-200
                      hover:text-green-600 dark:hover:text-green-400
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      rounded-xl transition-all
                      active:scale-[0.98]
                    "
                    onClick={onClose}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && (
                        <div className="
                          p-2 
                          bg-gray-100 dark:bg-gray-800 
                          rounded-lg
                        ">
                          {item.icon}
                        </div>
                      )}
                      <span className="font-medium text-lg">{item.label}</span>
                    </div>
                  </Link>
                ) : (
                  /* 有下拉菜单的项 */
                  <>
                    <button
                      onClick={() => toggleItemExpanded(item.label)}
                      className="
                        w-full
                        flex items-center justify-between
                        px-4 py-4
                        text-gray-800 dark:text-gray-200
                        hover:text-green-600 dark:hover:text-green-400
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        rounded-xl transition-all
                        active:scale-[0.98]
                      "
                      aria-expanded={expandedItems.has(item.label)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-lg">{item.label}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${expandedItems.has(item.label) ? 'rotate-180' : ''
                        }`} />
                    </button>

                    {/* 二级菜单 - 点击展开 */}
                    {expandedItems.has(item.label) && (
                      <div className="
                        ml-4 
                        border-l-2 border-gray-200 dark:border-gray-700 
                        pl-2
                        space-y-2
                        animate-[fadeIn_0.2s_ease-out]
                      ">
                        {/* 二级菜单内容 */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2">
                          <div className="space-y-4">
                            {item.dropdown.map((column: any, colIdx: number) => (
                              <div key={colIdx} className="pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    {column.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {column.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {column.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 ml-1">
                                  {column.items.map((subItem: any, subIdx: number) => (
                                    <Link
                                      key={subIdx}
                                      href={subItem.href}
                                      className="
                                        flex items-center space-x-3 p-3
                                        text-gray-700 dark:text-gray-300
                                        hover:text-green-600 dark:hover:text-green-400
                                        hover:bg-white dark:hover:bg-gray-700
                                        rounded-lg transition-colors
                                      "
                                      onClick={onClose}
                                    >
                                      <div className=" bg-gray-100 dark:bg-gray-700 rounded-md">
                                        {subItem.icon}
                                      </div>
                                      <span className="font-medium">{subItem.text}</span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};