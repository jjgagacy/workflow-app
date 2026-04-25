import { useAppearance } from "@/hooks/use-appearance";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDown, Filter, Palette } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { useAppModes } from "../hooks/use-appModes";

interface FilterMenuProps {
}

export const FilterMenu = ({ }: FilterMenuProps) => {
  const { activeColorTheme = 'default', setActiveColorTheme: setTheme } = useAppearance();
  const { allAppModeItems } = useAppModes();

  return (
    <div className="rounded-lg z-20">
      <Menu as="div" className="relative">
        <MenuButton className={`flex items-center space-x-2 text-13 max-w-xs rounded-md focus:outline-none cursor-pointer transition-colors`}>
          <div
            className={`flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg transition-colors ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
          >
            <Filter className="w-4 h-4 text-text-primary" />
            <span className="text-sm text-text-primary">筛选</span>
            <ChevronDown className="w-4 h-4 text-text-primary" />
          </div>
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
          <MenuItems className="bg-muted-light origin-top-right absolute right-0 px-2 py-1 mt-2 w-48 rounded-md shadow-lg  border border-[var(--border)] focus:outline-none z-100">
            {allAppModeItems.map(appMode => (
              <MenuItem key={appMode.name}>
                <button
                  className={`group flex items-center gap-2 rounded-md text-text-secondary w-full px-2 py-2 text-sm ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
                >
                  {appMode.icon && <appMode.icon className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{appMode.name}</span>
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}