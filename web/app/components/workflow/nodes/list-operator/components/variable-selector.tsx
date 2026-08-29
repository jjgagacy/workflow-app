import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { VarPicker } from "../../../components/variable/var-picker";
import { useNodeConfig } from "../../../hooks/use-node-config";
import type { Node, Variable, VariableSelector } from "../../../types";

interface ArrayVariableSelectorProps {
  nodeId: string;
  inputVariable?: VariableSelector;
  onSelect: (value: VariableSelector) => void;
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
  const { availableNodes, nodeVariableList } = useNodeConfig(nodeId);
  console.log('--', nodeVariableList);

  const arrayVariableList = useMemo(() => {
    return (nodeVariableList ?? [])
      .map((group) => ({
        ...group,
        variables: group.variables.filter((variable) => {
          const dataType = variable.dataType?.toLowerCase?.() ?? '';
          return dataType === 'array';
        }),
      }))
      .filter((group) => group.variables.length > 0);
  }, [nodeVariableList]);

  const handleVariableChange = (_variable: Variable, selector: VariableSelector) => {
    onSelect(selector);
  };

  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {t('workflow.nodes.list-operator.arrayVariable')}
      </div>
      <VarPicker
        nodeId={nodeId}
        value={inputVariable}
        onChange={handleVariableChange}
        availableNodes={availableNodes}
        nodeOutputVariables={arrayVariableList}
        className="w-full"
      />
    </section>
  );
};

export default ArrayVariableSelector;