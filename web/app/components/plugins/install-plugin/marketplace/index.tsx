'use client';

import { Dialog } from "@/app/ui/dialog";
import { useTranslation } from "react-i18next";
import { Plugin } from "../../types";
import { useCallback, useState } from "react";
import { InstallStep } from "../types";
import Install from "./steps/install";
import api from "@/api";
import { useCheckInstalled } from "../hooks/use-check-installed";

type InstallFromMarketplaceProps = {
  identifier: string;
  manifest: Plugin;
  onSuccess: () => void;
  onClose: () => void;
}

const InstallFromMarketplace = ({
  identifier,
  manifest,
  onSuccess,
  onClose
}: InstallFromMarketplaceProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<InstallStep>(InstallStep.readyToInstall);
  const [isInstalling, setIsInstalling] = useState(false);
  const { installInfo, isLoading, mutate } = useCheckInstalled({ identifiers: [identifier] });
  console.log(installInfo ? installInfo[identifier] : null);

  const getTitile = useCallback(() => {
    return t(`system.install_model.title`)
  }, [t]);

  const handleInstalled = useCallback(() => {
  }, []);

  const handleFailed = useCallback(() => {
  }, []);

  const handleStartToInstall = useCallback(() => {
  }, []);

  const handleInstall = useCallback(() => {
    if (isInstalling) return;
    setIsInstalling(true);
    try {

    } catch (error) {

    }
  }, []);

  const handleCancel = useCallback(() => {
    onClose();
  }, []);

  return (
    <>
      <Dialog
        isOpen={true}
        isLoading={isInstalling}
        title={getTitile()}
        description=""
        confirmText={t('app.actions.confirm')}
        cancelText={t('app.actions.cancel')}
        onConfirm={handleStartToInstall}
        onCancel={handleCancel}
      >
        {
          step === InstallStep.readyToInstall && (
            <Install
              identifier={identifier}
              manifest={manifest}
              onCancel={onClose}
              onInstalled={handleInstalled}
              onFailed={handleFailed}
              onStartToInstall={handleStartToInstall}
            />
          )
        }
      </Dialog>
    </>
  );
}

export default InstallFromMarketplace;