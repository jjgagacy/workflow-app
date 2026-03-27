import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { cn } from "@/utils/classnames";

type ProviderIconProps = {
  provider: ModelProviderInfo;
  className?: string;
}

const ProviderIcon = ({
  provider,
  className,
}: ProviderIconProps) => {
  const defaultLocale = getClientLocale();
  const locale = getLanguage(defaultLocale);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={getLocalizedText(provider.icon, locale)}
        className="w-auto h-[16px]"
      />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {getLocalizedText(provider.label, locale)}
      </span>
    </div>
  );
}

export default ProviderIcon;