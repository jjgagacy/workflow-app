import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon, HelpCircle, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Fragment } from "react/jsx-runtime";

export const HelpMenu = () => {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();

  const onHelpCenter = () => {

  }

  const onShortcuts = () => {

  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <HelpCircle className="h-5 w-5 text-text-secondary" />
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
        <MenuItems className={`bg-muted-light origin-top-right absolute right-0 mt-2 px-2 w-48 rounded-md shadow-2xl border border-[var(--border)] ring-opacity-5 py-2 focus:outline-none z-100`}>
          <MenuItem>
            {({ close }) => (
              <button
                onClick={() => {
                  onHelpCenter?.();
                  close();
                }}
                className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              >
                <HelpCircle className="mr-2 h-5 w-5 text-text-secondary" />
                {t('system.help_center') || 'Help Center'}
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ close }) => (
              <button
                onClick={() => {
                  onShortcuts?.();
                  close();
                }}
                className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              >
                <span className="mr-2 h-5 w-5 flex items-center justify-center text-text-secondary">
                  ⌨️
                </span>
                {t('system.canvas_shortcuts') || 'Canvas Shortcuts'}
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  )
}