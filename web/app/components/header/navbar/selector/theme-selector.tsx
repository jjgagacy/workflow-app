import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Palette } from "lucide-react";
import { getActiveThemeClass, getThemeHoverClass, ThemeType } from "@/types/theme";
import { useAppearance } from "@/hooks/use-appearance";

const DEFAULT_THEMES = [
  { name: 'Default', value: 'default' },
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Amber', value: 'amber' },
];

const SCALED_THEMES = [
  { name: 'Default', value: 'default-scaled' },
];

function getThemeName(value: string) {
  const allThemes = [...DEFAULT_THEMES, ...SCALED_THEMES];
  const theme = allThemes.find(theme => theme.value === value);
  return theme ? theme.name : 'default';
}

export function ThemeSelector() {
  const { activeColorTheme = 'default', setActiveColorTheme: setTheme } = useAppearance();

  return (
    <div className='flex items-center gap-2 rounded-lg mx-2'>
      <Menu as="div" className="relative">
        <MenuButton className={`flex items-center space-x-2 max-w-xs rounded-md focus:outline-none p-2 ${getThemeHoverClass(activeColorTheme as ThemeType)} cursor-pointer transition-colors`}>
          <Palette className="w-5 h-5 text-gray-400 hover:text-gray-500 mr-1" />
          {getThemeName(activeColorTheme)}
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
            <div className="text-gray-400 px-4 text-sm my-2 font-bold">Default</div>
            {DEFAULT_THEMES.map(item => (
              <MenuItem key={item.name}>
                {() => (
                  <div className={`flex items-center justify-between px-4 py-2 rounded-md text-sm text-gray-700 w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}  dark:text-white`}>
                    <button
                      className={`w-full font-medium text-left flex-1 ${getActiveThemeClass(activeColorTheme as ThemeType, item.value as ThemeType)}`}
                      onClick={() => setTheme(item.value)}
                    >
                      {item.name}
                    </button>
                    {item.value === activeColorTheme && (
                      <IconCheck className={`mr-2 h-4 w-4 ${getActiveThemeClass(activeColorTheme as ThemeType, item.value as ThemeType)}`} />
                    )}
                  </div>
                )}
              </MenuItem>
            ))}
            <hr className="my-2 border-[var(--border)]" />
            <div className="text-gray-400 text-sm px-4 my-2 font-bold">Scaled</div>
            {SCALED_THEMES.map(item => (
              <MenuItem key={item.name}>
                {() => (
                  <div className={`flex items-center justify-between px-4 py-2 rounded-md text-sm text-gray-700 w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}  dark:text-white`}>
                    <button className="w-full font-medium text-left flex-1" onClick={() => setTheme(item.value)}>
                      {item.name}
                    </button>
                    {item.value === activeColorTheme && (
                      <IconCheck className="mr-2 h-4 w-4" />
                    )}
                  </div>
                )}
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}