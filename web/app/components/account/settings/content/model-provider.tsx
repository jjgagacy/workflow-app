import { useTranslation } from "react-i18next";
import { ContentSection } from "../content-section";
import { useMarketplacePlugins } from "@/app/components/plugins/marketplace/hooks";
import Loading from "@/app/components/base/loading";
import { getClientLocale } from "@/i18n";
import List from "@/app/components/plugins/marketplace/list";
import { useMemo } from "react";
import { Plugin } from "@/app/components/plugins/types";
import { useModelProviderContext } from "@/context/model-provider-context";
import ModelProviderCard from "@/app/components/plugins/model-provider-card";

export default function ModelProvider() {
  const { t, i18n } = useTranslation();
  const { modelProviders, mutate, isLoading, total } = useMarketplacePlugins();
  const { modelProviderList: providers } = useModelProviderContext();
  const excludes: string[] = [];

  const allPlugins = useMemo(() => {
    const allPlugins: any = [...modelProviders?.filter(plugin => !excludes.includes(plugin.author)) || []];
    return allPlugins;
  }, [modelProviders, excludes]);

  return (
    <ContentSection
      title={t('system.model_provider.title')}
      description=""
    >
      {providers && (
        <>
          <div className="mb-4">
            <h2 className="text-md font-bold text-gray-500 dark:text-white mb-2">{t('system.model_provider.models_list')}</h2>
          </div>
          <div className='relative'>
            {providers.map((provider) => (
              <ModelProviderCard
                key={provider.providerName}
                provider={provider}
              />
            ))}
          </div>
        </>
      )}
      <header className="mb-8">
        <h1 className="text-md font-bold text-gray-500 dark:text-white">{t('system.model_provider.install_model_provider')}</h1>
      </header>
      {isLoading && <Loading />}
      {!isLoading && total > 0 && (
        <List
          plugins={allPlugins || []}
          locale={i18n.language}
        />
      )}
    </ContentSection>
  )
}