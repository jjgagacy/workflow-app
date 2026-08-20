import { useTranslation } from "react-i18next";
import { Variable, VariableSelector, Node, NodeOutputVariable } from "../../types";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { cn } from "@/utils/classnames";
import { Popover } from "@/app/components/base/popover";
import Button from "@/app/components/base/button";
import { VarPopList } from "./var-popList";
import { OperatorType } from "../../nodes/if-else/types";
import { VarPickerTrigger } from "./var-pickerTrigger";

type PickerProps = {
  nodeId: string;
  value?: VariableSelector;
  varType?: OperatorType;
  readonly?: boolean;
  className?: string;
  onChange: (variable: Variable, selector: VariableSelector) => void;
  onOpen?: () => void;
  onlyLeafNodeVar?: boolean;
  filterVar?: (variable: Variable, selector: VariableSelector) => boolean;
  availableNodes?: Node[];
  nodeOutputVariables?: NodeOutputVariable[];
  placeholder?: string;
  minWidth?: number;
}

export const VarPicker = ({
  nodeId,
  value,
  readonly,
  className,
  onChange,
  onOpen,
  onlyLeafNodeVar,
  filterVar,
  availableNodes,
  nodeOutputVariables,
  placeholder,
  minWidth,
  varType,
}: PickerProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const reactflow = useReactFlow();

  return (
    <div className={cn("h-full w-full", className)}>
      <Popover
        trigger={(
          <div className="w-full cursor-pointer">
            <VarPickerTrigger
              variableSelector={value}
              varType={varType || "string"}
              availableNodes={availableNodes}
            />
          </div>
        )}
        direction="bottom"
        gap={4}
        offset={0}
        padding={8}
        triggerClassName="h-full w-full"
        panelClassName=""
        sameWidth={false}
        disabled={false}
        portal={true}
      >
        {({ close }) => (
          <VarPopList
            variables={nodeOutputVariables || []}
            onChange={(variable, selector) => {
              onChange(variable, selector);
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
}