import { useTranslation } from "react-i18next";
import { AppMode, AppModeItem, getAllAppModes, getAppModeItems } from "../constants/appModes";
import { useMemo } from "react";

export const useAppModes = () => {
  const { t } = useTranslation();

  const appModeItems = useMemo(() => getAppModeItems(t), [t]);
  const allAppModeItems = useMemo(() => getAllAppModes(t), [t]);

  const getAppMode = useMemo(() => {
    return appModeItems.reduce((acc, item) => {
      acc[item.value] = item;
      return acc;
    }, {} as Record<AppMode | 'all', AppModeItem>);
  }, [appModeItems]);

  const getAllAppMode = useMemo(() => {
    return allAppModeItems.reduce((acc, item) => {
      acc[item.value] = item;
      return acc;
    }, {} as Record<AppMode | 'all', AppModeItem>);
  }, [allAppModeItems]);

  return {
    appModeItems,
    allAppModeItems,
    getAppMode,
    getAllAppMode,
    AppMode,
  };
}