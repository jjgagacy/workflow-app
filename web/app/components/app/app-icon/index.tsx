import { cn } from "@/utils/classnames";
import { AppIconType } from "../app.type";
import Button from "../../base/button";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../../base/tooltip";

interface AppIconProps {
  iconType: AppIconType;
  icon?: string;
  className?: string;
  onClick?: () => void;
}

export type AppIconIcon = {
  type: 'icon';
  icon: string;
}

export type AppIconEmoji = {
  type: 'emoji';
  icon: string;
}

export type AppIconSource = AppIconIcon | AppIconEmoji;

export default function AppIcon({ iconType, icon, className, onClick }: AppIconProps) {
  const { t } = useTranslation();

  return (
    <div className="">
      {/* 提示框出现在右侧 */}
      <Tooltip content={t('app.newApp.chooseAppIcon')} placement="right">
        <div
          className={cn('w-10 h-10 text-lg flex items-center justify-center relative rounded-md grow-0 shrink-0 overflow-hidden cursor-pointer border border-[var(--border)] hover:bg-secondary dark:hover:bg-secondary/90', className)}
          onClick={onClick}>
          {icon}
        </div>
      </Tooltip>
    </div>
  );
}
