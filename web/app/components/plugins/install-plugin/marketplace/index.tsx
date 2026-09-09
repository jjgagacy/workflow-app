'use client';

import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import { createPluginIdentifier, Plugin } from "../../types";
import { useCallback, useEffect, useState } from "react";
import { InstallStep } from "../types";
import Install from "./steps/install";
import { useCheckInstalled } from "../hooks/use-check-installed";
import Installed from "../base/installed";
import api from "@/api";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";

type InstallFromMarketplaceProps = {
  identifier: string; // plugin_id=`author/name`
  manifest: Plugin;
  onClose: () => void;
  onInstalled?: (plugin: Plugin) => void;
  onStartInstall?: () => void;
  onFailed?: (message: string) => void;
}

const InstallFromMarketplace = ({
  identifier,
  manifest,
  onInstalled,
  onClose,
  onStartInstall,
  onFailed
}: InstallFromMarketplaceProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<InstallStep>(InstallStep.readyToInstall);
  const [isInstalling, setIsInstalling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { installInfo, isLoading, mutate } = useCheckInstalled({ identifiers: [identifier] });
  const installPluginFromMarketplace = api.plugin.useInstallPluginFromMarketplace();

  useEffect(() => {
    setStep(installInfo && installInfo[identifier] ? InstallStep.installed : InstallStep.readyToInstall);
  }, [installInfo, identifier, setStep]);

  const getTitile = useCallback(() => {
    return t(`system.install_model.title`)
  }, [t]);

  const handleInstall = useCallback(async () => {
    if (isInstalling) return;
    onStartInstall?.();
    setIsInstalling(true);
    try {
      await installPluginFromMarketplace({ identifiers: [identifier] });
      setStep(InstallStep.installed);
      onInstalled?.(manifest);
    } catch (error: any) {
      const errString = getErrorMessage(error);
      toast.error(errString);
      onFailed?.(errString);
      setErrorMessage(errString);
      setStep(InstallStep.installFailed);
    } finally {
      setIsInstalling(false);
    }
  }, [onStartInstall, isInstalling, setIsInstalling, installPluginFromMarketplace, identifier, manifest, onInstalled, onFailed]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      <Dialog
        isOpen={true}
        isLoading={isInstalling}
        title={getTitile()}
        description=""
        confirmText={t('app.actions.confirm')}
        cancelText={t('app.actions.cancel')}
        onConfirm={handleInstall}
        onCancel={handleCancel}
        actions={step === InstallStep.readyToInstall}
      >
        {step === InstallStep.readyToInstall && (
          <Install
            identifier={identifier}
            manifest={manifest}
            onCancel={onClose}
            onInstalled={onInstalled}
            onFailed={onFailed}
            onStartToInstall={handleInstall}
          />
        )}

        {[InstallStep.installed, InstallStep.installFailed].includes(step) && (
          <Installed
            manifest={manifest}
            isFailed={step === InstallStep.installFailed}
            errorMessage={step === InstallStep.installFailed ? errorMessage : undefined}
            onClose={onClose}
          />
        )}
      </Dialog>
    </>
  );
}

export default InstallFromMarketplace;