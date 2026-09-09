import api from "@/api"
import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { ModelProvider } from "@/api/graphql/model-provider/types/model-provider";
import { PageInfo } from "@/api/graphql/types/page-info";
import { useModelProviderContext } from "@/context/model-provider-context";
import { useDebounceFn } from "ahooks";
import i18next from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const useMarketplacePlugins = (modelProviderList: ModelProviderInfo[] = [], searchText: string = '') => {
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const getMarketplaceModelProviders = api.marketplace.useGetMarketplaceModelProviders();

  const exclude = useMemo(() => {
    return modelProviderList?.map(provider => provider.providerName.replace(/(.+)\/([^/]+)$/, '$1').split('/')[1] || '') || [];
  }, [modelProviderList]);

  const mutate = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const res = await getMarketplaceModelProviders({ excludes: exclude, category: 'name', query });
      setModelProviders(res.data);
      setPageInfo(res.pageInfo);
      setError(undefined);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [getMarketplaceModelProviders, exclude]);

  const { run: debouncedMutate } = useDebounceFn(mutate, { wait: 300 });

  useEffect(() => {
    debouncedMutate(searchText);
    // re-fetch when excludes change too, since modelProviderList may resolve after the initial fetch
  }, [searchText, exclude]);

  return {
    modelProviders,
    total: pageInfo?.total || modelProviders?.length || 0,
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