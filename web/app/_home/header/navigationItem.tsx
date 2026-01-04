import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { JSX, useEffect, useRef, useState } from "react";

interface NavigationItemDropDown {
  title: string;
  description: string;
  icon: JSX.Element;
  items: {
    text: string;
    icon: JSX.Element;
  }[];
}

interface NavigationitemProps {
  item: {
    label: string;
    href: string;
    dropdown?: NavigationItemDropDown[];
  }
}
export default function NavigationItem({ item }: NavigationitemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef.current!);
    }
    if (item.dropdown) {
      setTimeout(() => setIsOpen(true), 200);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms
  };

  const adjustDropdownPosition = () => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    const rect = dropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 16; // 安全边距

    let translateX = -50; // 默认 -50%

    // 左侧溢出
    if (rect.left < margin) {
      const overflow = margin - rect.left;
      translateX += (overflow / rect.width) * 100;
    }

    // 右侧溢出
    if (rect.right > viewportWidth - margin) {
      const overflow = rect.right - (viewportWidth - margin);
      translateX -= (overflow / rect.width) * 100;
    }

    dropdown.style.transform = `translateX(${translateX}%)`;
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(adjustDropdownPosition);
    }
  }, [isOpen]);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item.dropdown ? (
        <>
          <button
            ref={triggerRef}
            className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors font-medium"
          >
            <span>{item.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-1/2 transform mt-2 md:w-[600px] lg:w-[800px] max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]"
              style={{ transform: 'translateX(-50%)' }}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <div className="p-6">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2">
                  {item.dropdown.map((column, idx) => (
                    <div key={idx}>
                      <div className="flex items-center space-x-3 mb-4">
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
                      <ul className="space-y-1">
                        {column.items.map((subItem, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              href="#"
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                                {subItem.icon}
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
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
          )}
        </>
      ) : (
        <Link
          href={item.href}
          className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
        >
          {item.label}
        </Link>
      )}
    </div>
  );
}