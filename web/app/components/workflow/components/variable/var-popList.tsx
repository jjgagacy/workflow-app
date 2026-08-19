import { useTranslation } from "react-i18next";
import { NodeOutputVariable, Variable, VariableSelector } from "../../types";
import { EmptyData } from "@/app/components/base/empty-data";

interface VarSelectorProps {
  variables: NodeOutputVariable[];
  onChange: (variable: Variable, selector: VariableSelector) => void;
  wrapperWidth?: number;
}

export const VarPopList = ({
  variables,
  onChange,
  wrapperWidth
}: VarSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="space-y-1 rounded-md p-1 shadow-md"
      style={{ width: wrapperWidth || 236 }}>
      {!variables || variables.length === 0 ?
        <EmptyData
          title="No available vars"
          description={(
            <div className="text-accent">
              No vars
            </div>
          )}
        />
        : (
          <>
            123
          </>
        )}
    </div>
  );
}