import React from "react";
import { Plugin } from "../types";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { cn } from "@/utils/classnames";
import Button from "../../base/button";
import { useTranslation } from "react-i18next";

export type CardProps = {
  className?: string;
  plugin: Plugin;
  footer?: React.ReactNode;
  isLoading?: boolean;
  locale?: string;
  onClick?: () => void;
  hideInstall?: boolean;
}

const Card = ({ className, plugin, footer, isLoading, locale: localeFromProps, onClick, hideInstall }: CardProps) => {
  const { t } = useTranslation();
  const defaultLocale = getClientLocale();
  const locale = getLanguage(localeFromProps || defaultLocale);

  return (
    <div className={cn(className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-auto rounded-lg flex items-center justify-center text-white font-medium`}>
            <img src={plugin.icon} alt={plugin.author} className="w-auto h-[16px]" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{getLocalizedText(plugin.label, locale)}</h3>
            <p className="text-xs text-gray-400"></p>
          </div>
        </div>
        {!hideInstall && (<Button variant='primary' size={'small'} onClick={onClick}>
          {t('app.actions.install')}
        </Button>)}
      </div>

      <div className="flex items-center space-x-1 mb-3">
        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm text-gray-600"></span>
      </div>

      {plugin.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {getLocalizedText(plugin.description, locale)}
        </p>
      )}
    </div>
  );
}

export default React.memo(Card);
