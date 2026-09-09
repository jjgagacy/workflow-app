'use client';

import { useCallback } from "react";
import Card from "../../card";
import { createPluginIdentifier, Plugin } from "../../types"
import { useMixedTranslation } from "../hooks";
import { useBoolean } from "ahooks";
import InstallFromMarketplace from "../../install-plugin/marketplace";

type CardWrapperProps = {
  plugin: Plugin;
  locale?: string;
  onInstalled?: (plugin: Plugin) => void;
  onFailed?: (message: string) => void;
}

const CardWrapper = ({
  plugin,
  locale,
  onInstalled,
  onFailed,
}: CardWrapperProps) => {
  const { t } = useMixedTranslation(locale);
  const [isShowInstallDialog, { setTrue: showInstallDialog, setFalse: hideInstallDialog }] = useBoolean(false);

  const handleInstallClick = useCallback(() => {
    showInstallDialog();
  }, []);

  return (
    <>
      <div
        className="bg-background rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow duration-200"
      >
        <Card
          key={`${plugin.author}/${plugin.name}`}
          plugin={plugin}
          locale={locale}
          onClick={handleInstallClick}
        />
      </div>
      {
        isShowInstallDialog && (
          <InstallFromMarketplace
            manifest={plugin}
            identifier={createPluginIdentifier(plugin)}
            onClose={hideInstallDialog}
            onInstalled={() => onInstalled?.(plugin)}
            onFailed={onFailed}
          />
        )
      }
    </>
  );
}

export default CardWrapper;