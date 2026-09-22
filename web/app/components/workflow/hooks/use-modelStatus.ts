import { useTranslation } from "react-i18next";

export const useModelStatus = () => {
  const { t } = useTranslation();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('workflow.model.modelStatus.active');
      case 'no-configure':
        return t('workflow.model.modelStatus.noConfigure');
      case 'quota-exceeded':
        return t('workflow.model.modelStatus.quotaExceeded');
      case 'no-permission':
        return t('workflow.model.modelStatus.noPermission');
      case 'disabled':
        return t('workflow.model.modelStatus.disabled');
      default:
        return t('workflow.model.modelStatus.unknown');
    }
  }

  return { getStatusText };
}