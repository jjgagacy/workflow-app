import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export const useExceptionStrategyItems = (): SelectItem[] => {
  const { t } = useTranslation();

  return useMemo(() => [
    {
      value: 'stop-execution',
      name: t('workflow.errorHandler.stopExecution'),
      description: t('workflow.errorHandler.stopExecutionDesc'),
    },
    {
      value: 'return-default',
      name: t('workflow.errorHandler.returnDefault'),
      description: t('workflow.errorHandler.returnDefaultDesc'),
    },
  ], [t]);
}
