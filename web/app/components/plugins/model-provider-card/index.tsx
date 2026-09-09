import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { cn } from "@/utils/classnames";
import { useTranslation } from "react-i18next";
import { MoreVertical, Trash2 } from "lucide-react";
import ProviderIcon from "../provider-icon";
import CredentialPanel from "./credential-panel";
import { Popover } from "../../base/popover";
import { useDialog } from "../../hooks/use-dialog";
import { useCallback } from "react";
import api from "@/api";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";

type ModelProviderCardProps = {
  provider: ModelProviderInfo;
  onOpenModal?: () => void;
  onPluginRemoved?: () => void;
}

const ModelProviderCard = ({ provider, onOpenModal, onPluginRemoved }: ModelProviderCardProps) => {
  const { t } = useTranslation();
  const { showDialog } = useDialog();
  const uninstallPluginFromMarketplace = api.plugin.useUninstallPluginFromMarketplace();

  const handleRemovePlugin = useCallback(async (close: () => void) => {
    close();
    const pluginId = provider.providerName.replace(/(.+)\/([^/]+)$/, '$1');

    await showDialog({
      title: t('system.model_provider.remove_confirm_title'),
      description: t('system.model_provider.remove_confirm_description'),
      confirmText: t('system.model_provider.remove'),
      cancelText: t('app.actions.cancel'),
      destructive: true,
      onConfirm: async () => {
        try {
          await uninstallPluginFromMarketplace({ identifiers: [pluginId] });
          onPluginRemoved?.();
        } catch (error: any) {
          toast.error(getErrorMessage(error));
        }
      }
    });
  }, [showDialog, t, provider, uninstallPluginFromMarketplace, onPluginRemoved]);

  return (
    <div className={cn(
      'relative mb-4 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-background shadow-xs',
      'transition-all duration-200 hover:border-[var(--border)] hover:shadow-md'
    )}>
      <Popover
        trigger={
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        }
        direction="bottom end"
        className="float-right"
        triggerClassName="absolute right-2.5 top-2.5 z-10"
        panelClassName="bg-background rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 min-w-[120px]"
      >
        {({ close }) => (
          <button
            type="button"
            onClick={() => handleRemovePlugin(close)}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-red-50/80 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('system.model_provider.remove')}
          </button>
        )}
      </Popover>

      {/* 主信息展示区：大空间留白，凸显品牌图标与标题 */}
      <div className="flex items-center justify-between p-4 pr-10">
        <div className="flex shrink-0 items-center justify-center rounded-xl p-2.5 shadow-2xs">
          <ProviderIcon provider={provider} className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center text-xs text-gray-600 font-medium">
          <CredentialPanel provider={provider} onSetup={onOpenModal} />
        </div>
      </div>
    </div>
  );
};

export default ModelProviderCard;