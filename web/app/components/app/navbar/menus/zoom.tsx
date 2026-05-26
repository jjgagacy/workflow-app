import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getThemeHoverClass, ThemeType } from "@/types/theme";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Fragment } from "react/jsx-runtime";
import { dispatchWorkflowViewportAction } from "@/app/components/workflow/utils/viewport";

export const ZoomControlsMenu = () => {
  const { t } = useTranslation();
  const { activeColorTheme } = useCustomTheme();
  const onZoomIn = () => {
    dispatchWorkflowViewportAction('zoom-in');
  }

  const onZoomOut = () => {
    dispatchWorkflowViewportAction('zoom-out');
  }

  const onResetZoom = () => {
    dispatchWorkflowViewportAction('reset-zoom');
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Maximize className="h-4 w-4 text-text-secondary" />
        <ChevronDownIcon className="h-3 w-3 text-text-secondary" aria-hidden="true" />
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
        <MenuItems className={`bg-muted-light origin-top-right absolute right-0 mt-2 px-2 w-40 rounded-md shadow-2xl border border-[var(--border)] ring-opacity-5 py-2 focus:outline-none z-100`}>
          <MenuItem>
            {({ close }) => (
              <button
                onClick={() => {
                  onZoomIn?.();
                  close();
                }}
                className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              >
                <ZoomIn className="mr-1 h-4 w-4 text-text-secondary" />
                {t('app.appMenu.zoomIn')}
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ close }) => (
              <button
                onClick={() => {
                  onZoomOut?.();
                  close();
                }}
                className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              >
                <ZoomOut className="mr-1 h-4 w-4 text-text-secondary" />
                {t('app.appMenu.zoomOut')}
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ close }) => (
              <button
                onClick={() => {
                  onResetZoom?.();
                  close();
                }}
                className={`flex font-semibold text-13 items-center px-4 py-2 text-text-secondary rounded-md w-full text-left ${getThemeHoverClass(activeColorTheme as ThemeType)}`}
              >
                <Maximize className="mr-1 h-4 w-4 text-text-secondary" />
                {t('app.appMenu.resetZoom')}
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  )
}