import { VarPicker } from "../../../components/variable/var-picker";
import type { Node, NodeOutputVariable, Variable, VariableSelector } from "../../../types";

type InputVariableSectionProps = {
  nodeId: string;
  inputVariable?: VariableSelector;
  availableNodes?: Node[];
  nodeOutputVariables?: NodeOutputVariable[];
  onChange: (selector: VariableSelector) => void;
};

export const InputVariableSection = ({
  nodeId,
  inputVariable,
  availableNodes,
  nodeOutputVariables,
  onChange,
}: InputVariableSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
      <VarPicker
        nodeId={nodeId}
        value={inputVariable}
        onChange={(_variable: Variable, selector: VariableSelector) => onChange(selector)}
        availableNodes={availableNodes}
        nodeOutputVariables={nodeOutputVariables}
        className="w-full"
      />
    </section>
  );
};
