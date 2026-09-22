import { useCustomTheme } from "@/app/components/provider/customThemeProvider";
import { getClientLocale, getLocalizedText } from "@/i18n";
import { getLanguage } from "@/i18n/config";
import { I18nObject } from "@/types/model";

type ModelIconProps = {
  small?: boolean;
  alt?: string;
  src: {
    icon?: I18nObject;
    iconDark?: I18nObject;
    iconSmall?: I18nObject;
    iconSmallDark?: I18nObject;
  }
}

export const ModelIcon = ({
  small = true,
  alt,
  src: {
    icon,
    iconDark,
    iconSmall,
    iconSmallDark
  }
}: ModelIconProps) => {
  const locale = getLanguage(getClientLocale());
  const { darkmode } = useCustomTheme();

  const selectedIcon = small
    ? darkmode
      ? iconSmallDark ?? iconSmall
      : iconSmall ?? icon
    : darkmode
      ? iconDark ?? icon
      : icon;

  return selectedIcon ? (
    <img
      src={getLocalizedText(selectedIcon, locale)}
      alt={alt}
      className="h-4 w-4 shrink-0 rounded-sm" />
  ) : null;
}