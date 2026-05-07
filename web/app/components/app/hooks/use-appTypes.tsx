import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppType, AppTypeItem, getAllAppTypes } from "../constants/appTypes";

export const useAppTypes = () => {
  const { t } = useTranslation();

  const appTypeItems = useMemo(() => getAllAppTypes(t), [t]);

  const getAppType = useMemo(() => {
    return appTypeItems.reduce((acc, item) => {
      acc[item.value] = item;
      return acc;
    }, {} as Record<AppType, AppTypeItem>);
  }, [appTypeItems]);

  return {
    appTypeItems,
    getAppType,
    AppType,
  };
};