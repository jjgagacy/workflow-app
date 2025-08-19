import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useActiveTheme } from "../active-theme";
import { Fragment } from "react";
import { IconCheck } from "@tabler/icons-react";

const DEFAULT_THEMES = [
    { name: 'Default', value: 'default'},
    { name: 'Blue', value: 'blue'},
    { name: 'Green', value: 'green'},
    { name: 'Amber', value: 'amber'},
];

const SCALED_THEMES = [
    { name: 'Default', value: 'default-scaled' },
];

function getThemeName(value: string) {
  const allThemes = [...DEFAULT_THEMES, ...SCALED_THEMES];
  const theme = allThemes.find(theme => theme.value === value);
  return theme ? theme.name : 'Unknown Theme';
}

export function ThemeSelector() {
    const { activeTheme, setActiveTheme } = useActiveTheme();

    return (
        <div className='flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded-md mx-2'>
            <Menu as="div" className="relative">
                <MenuButton className="flex items-center space-x-2 max-w-xs rounded-md focus:outline-none  px-2 py-2">
                    <span className='text-muted-foreground hidden sm:block'>
                        选择一个主题：
                    </span>
                    {getThemeName(activeTheme)}
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
                    <MenuItems className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 focus:outline-none z-100">
                        <div className="text-gray-600 px-4 text-sm my-2">Default</div>
                        {DEFAULT_THEMES.map(theme => (
                            <MenuItem key={theme.name}>
                                {() => (
                                    <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                                        <button className="text-primary w-full text-left flex-1" onClick={() => setActiveTheme(theme.value) }>
                                            {theme.name}
                                        </button>
                                        {theme.value === activeTheme && (
                                            <IconCheck className="mr-2 h-4 w-4" />
                                        )}
                                    </div>
                                )}
                            </MenuItem>
                        ))}
                        <hr className="border-[var(--border)]" />
                        <div className="text-gray-600 px-4 text-sm my-2">Scaled</div>
                        {SCALED_THEMES.map(theme => (
                            <MenuItem key={theme.name}>
                                {() => (
                                    <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                                        <button className="text-primary w-full text-left flex-1" onClick={() => setActiveTheme(theme.value) }>
                                            {theme.name}
                                        </button>
                                        {theme.value === activeTheme && (
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