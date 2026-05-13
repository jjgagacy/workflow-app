import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { AppMenuItem, Apps } from "../../app.type";
import { ChevronDownIcon, Copy, Edit, Edit2, Pencil, Settings, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { useCustomTheme } from "../../../provider/customThemeProvider";
import { Tabs } from "@/app/components/base/tabs";
import Button from "@/app/components/base/button";

interface AppActionsProps {
  appInfo: Apps,
  menuItems: AppMenuItem[],
}

export function Operations({ appInfo: apps, menuItems }: AppActionsProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(apps.name);
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();

  const handleRename = () => {
    setIsRenaming(false);
  }

  const handleKeyPress = () => {
  }

  const onDuplicate = () => {
  }

  const onDelete = () => {
  }


  const TAB_VALUES = [...menuItems.map(item => item.id)] as const;
  type TabValue = (typeof TAB_VALUES)[number];
  const [activeTab, setActiveTab] = useState<TabValue>('');
  const tabValues: { value: TabValue, label: string, icon: React.ReactNode }[] = menuItems.map(item => ({
    value: item.id as TabValue,
    label: item.name,
    icon: <item.icon className="mr-1 h-4 w-4 text-text-secondary" />
  }));

  return (
    <>
      <Menu as="div" className="relative">
        <MenuButton className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="text-xl"><Edit className="w-4 h-4 text-text-primary" /></span>
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyPress}
              className="px-1 py-0.5 text-sm border rounded-md bg-white dark:bg-gray-800 text-text-primary border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="font-medium text-text-primary">{apps.name}</span>
          )}
          <ChevronDownIcon className="h-4 w-4 text-text-secondary" aria-hidden="true" />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className={`bg-muted-light origin-top-left absolute left-0 mt-2 px-2 w-48 rounded-md shadow-2xl border border-[var(--border)] ring-opacity-5 py-2 focus:outline-none z-100`}>
            <MenuItem>
              {({ close }) => (
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    close();
                  }}
                  className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
                >
                  <Edit className="mr-2 h-4 w-4 text-text-secondary" />
                  {t('app.newApp.editName')}
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ close }) => (
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    close();
                  }}
                  className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
                >
                  <Settings className="mr-2 h-4 w-4 text-text-secondary" />
                  {t('app.actions.settings')}
                </button>
              )}
            </MenuItem>

            <hr className="my-2 border-[var(--border-card)]" />
            <MenuItem>
              {({ close }) => (
                <button
                  onClick={() => {
                    onDelete?.();
                    close();
                  }}
                  className={`flex font-semibold text-13 items-center px-4 py-2 text-red-600 rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('system.delete') || 'Delete'}
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
      {menuItems.map((item) => (
        <div key={item.id}>
          <a
            href={item.href}
            className={`flex font-semibold text-13 items-center px-4 py-2 text-text-primary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
            onClick={(e) => {
              e.preventDefault();
              close();
              globalThis.location.href = item.href;
            }}
          >
            <item.icon className="mr-1 h-4 w-4 text-text-primary" />
            {item.name}
          </a>
        </div>
      ))}
    </>
  );
}
