import api from "@/api"
import i18next from "i18next";
import { useTranslation } from "react-i18next";

export const useMarketplacePlugins = () => {
  const { error, modelProviders, mutate, isLoading } = api.marketplace.useGetModelProviders();

  return {
    modelProviders,
    total: modelProviders?.length || 0,
    error,
    mutate,
    isLoading
  }
}

export const useMixedTranslation = (locale?: string) => {
  let t = useTranslation().t;

  if (locale) {
    t = i18next.getFixedT(locale);
  }

  return {
    t,
  }
}