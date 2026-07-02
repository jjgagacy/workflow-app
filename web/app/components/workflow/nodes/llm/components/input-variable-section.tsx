import { SimpleSelect } from "@/app/ui/select";
import type { LLMNodeData } from "../types";

type SelectItem = {
  value: string;
  name: string;
  description?: string;
  group?: string;
};

type InputVariableSectionProps = {
  inputVariable: string;
  variableItems: SelectItem[];
  onChange: (patch: Partial<LLMNodeData>) => void;
};

export const InputVariableSection = ({ inputVariable, variableItems, onChange }: InputVariableSectionProps) => {
  return (
    <section className="space-y-3 rounded-xl bg-muted/15 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">输入变量</div>
      <SimpleSelect
        items={variableItems}
        defaultValue={inputVariable}
        allowSearch={false}
        className="w-full"
        onSelect={(item) => onChange({ inputVariable: String(item.value) })}
      />
    </section>
  );
};
