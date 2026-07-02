import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import { buildVariableSelectItems, buildWorkflowVariableOptions } from "../../../components/nodes-shared/variable-select";
import { useWorkflowStore } from "../../../context";
import type { Node } from "../../../types";

interface ArrayVariableSelectorProps {
  nodeId: string;
  inputVariable: string;
  onSelect: (value: string) => void;
}

const isArrayType = (typeLabel?: string) => {
  const normalized = String(typeLabel ?? '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return normalized === 'array' || normalized.includes('array');
};

export const ArrayVariableSelector = ({
  nodeId,
  inputVariable,
  onSelect
}: ArrayVariableSelectorProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);

  const arrayVariableItems = useMemo(() => {
    const nodes = store.getState().nodes as Node[];
    const variableOptions = buildWorkflowVariableOptions({
      t,
      nodeId,
      nodes,
      envVariables,
      chatEnvVariables,
    });

    const filteredOptions = variableOptions.filter((option) => isArrayType(option.description));

    return buildVariableSelectItems({
      t,
      currentValue: inputVariable,
      options: filteredOptions,
    });
  }, [chatEnvVariables, envVariables, inputVariable, nodeId, store, t]);

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {t('workflow.nodes.list-operator.arrayVariable')}
      </div>
      <SimpleSelect
        items={arrayVariableItems}
        defaultValue={inputVariable}
        allowSearch={false}
        className="w-full"
        onSelect={(item) => onSelect(String(item.value))}
      />
    </section>
  );
};

export default ArrayVariableSelector;