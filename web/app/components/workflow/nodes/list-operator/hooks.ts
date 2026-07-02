import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

export const useListOperatorOptions = () => {
  const { t } = useTranslation();

  const conditionOperatorItems = useMemo<SelectItem[]>(() => [
    { value: 'contains', name: t('workflow.nodes.list-operator.operators.contains') },
    { value: 'not_contains', name: t('workflow.nodes.list-operator.operators.not_contains') },
    { value: 'equals', name: t('workflow.nodes.list-operator.operators.equals') },
    { value: 'not_equals', name: t('workflow.nodes.list-operator.operators.not_equals') },
    { value: 'starts_with', name: t('workflow.nodes.list-operator.operators.starts_with') },
    { value: 'ends_with', name: t('workflow.nodes.list-operator.operators.ends_with') },
    { value: 'is_empty', name: t('workflow.nodes.list-operator.operators.is_empty') },
    { value: 'is_not_empty', name: t('workflow.nodes.list-operator.operators.is_not_empty') },
  ], [t]);

  const logicalOperatorItems = useMemo<SelectItem[]>(() => [
    { value: 'and', name: t('workflow.nodes.list-operator.logical.and') },
    { value: 'or', name: t('workflow.nodes.list-operator.logical.or') },
  ], [t]);

  const sortOrderItems = useMemo<SelectItem[]>(() => [
    { value: 'asc', name: t('workflow.nodes.list-operator.sort.asc') },
    { value: 'desc', name: t('workflow.nodes.list-operator.sort.desc') },
  ], [t]);

  return {
    conditionOperatorItems,
    logicalOperatorItems,
    sortOrderItems,
  };
};