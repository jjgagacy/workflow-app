import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import type { I18nObject } from "@/types/model";

type IconValue = I18nObject | string | undefined;

type ModelIconProps = {
  small?: boolean;
  alt?: string;
  src: {
    icon?: IconValue;
    iconDark?: IconValue;
    iconSmall?: IconValue;
    iconSmallDark?: IconValue;
  };
};

const resolveIconUrl = (icon: IconValue, locale: string) => {
  if (!icon) return "";
  if (typeof icon === "string") return icon;
  return getLocalizedText(icon, locale);
};

export const ModelIcon = ({
  small = true,
  alt,
  src: { icon, iconDark, iconSmall, iconSmallDark },
}: ModelIconProps) => {
  const locale = getLanguage(getClientLocale());
  const { darkmode } = useCustomTheme();

  const selectedIcon = small
    ? darkmode
      ? iconSmallDark ?? iconSmall ?? iconDark ?? icon
      : iconSmall ?? icon ?? iconDark
    : darkmode
      ? iconDark ?? icon ?? iconSmallDark ?? iconSmall
      : icon ?? iconDark ?? iconSmall ?? iconSmallDark;

  const iconUrl = resolveIconUrl(selectedIcon, locale);

  return iconUrl ? (
    <img
      src={iconUrl}
      alt={alt}
      className="h-4 w-4 shrink-0 rounded-sm"
    />
  ) : null;
};