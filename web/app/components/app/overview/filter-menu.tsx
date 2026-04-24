import { useAppearance } from "@/hooks/use-appearance";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDown, Filter, Palette } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

interface FilterMenuProps {
}

export const FilterMenu = ({ }: FilterMenuProps) => {
  const { activeColorTheme = 'default', setActiveColorTheme: setTheme } = useAppearance();

  return (
    <div className=" bg-background rounded-lg shadow-lg z-20">
      <Menu as="div" className="relative">
        <MenuButton className={`flex items-center space-x-2 text-13 max-w-xs rounded-md focus:outline-none p-2 cursor-pointer transition-colors`}>
          <button
            // onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg transition-colors ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
          >
            <Filter className="w-4 h-4 text-text-primary" />
            <span className="text-sm text-text-primary">筛选</span>
            <ChevronDown className="w-4 h-4 text-text-primary" />
          </button>
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
            {['全部类型', 'Chatbot', '工作流应用', 'Agent'].map(type => (
              <MenuItem key={type}>
                <button
                  className={`group flex rounded-md items-center w-full px-2 py-2 text-sm ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
                >
                  {type}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}