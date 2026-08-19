import { useTranslation } from "react-i18next";
import { Variable, VariableSelector, Node, NodeOutputVariable } from "../../types";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { cn } from "@/utils/classnames";
import { Popover } from "@/app/components/base/popover";
import Button from "@/app/components/base/button";

type PickerProps = {
  nodeId: string;
  value: VariableSelector | string;
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
  minWidth
}: PickerProps) => {
  const { t } = useTranslation();
  const store = useStoreApi();
  const reactflow = useReactFlow();

  return (
    <div className={cn(className)}>
      <Popover
        trigger={<Button variant={'ghost'}>Open Popover</Button>}
        direction="bottom"
        gap={4}
        offset={0}
        padding={8}
        triggerClassName=""
        panelClassName="bg-green-50 dark:bg-gray-800 rounded shadow-lg"
        sameWidth={false}
        disabled={false}
        portal={true}
      >
        {({ close }) => (
          <div className="p-4 z-[1000] w-80 h-60 ">
            <p>This is the content of the popover.</p>
            <Button variant={'primary'} onClick={() => close()}>Action</Button>
          </div>
        )}
      </Popover>
    </div>
  );
}