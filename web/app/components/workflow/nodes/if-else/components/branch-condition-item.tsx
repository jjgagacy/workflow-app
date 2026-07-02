import { SimpleSelect } from "@/app/ui/select";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NodeInput } from "../../../components/base/node-input";
import type { OperatorOption } from "../hooks/use-if-else-operator-options";
import type { Condition, ConditionOperator, OperatorType } from "../types";
import type { SelectItem, VariableOption } from "./branch-list.types";

const SELECT_CLASS_NAME = "w-full";

type BranchConditionItemProps = {
  branchId: string;
  condition: Condition;
  conditionIndex: number;
  operatorOptionsByType: Record<OperatorType, OperatorOption[]>;
  variableOptions: VariableOption[];
  typeItems: SelectItem[];
  onRemoveCondition: (branchId: string, conditionId: string) => void;
  onConditionTypeChange: (branchId: string, conditionId: string, value: OperatorType) => void;
  onConditionFieldChange: (branchId: string, conditionId: string, key: "leftValue" | "rightValue", value: string) => void;
  onConditionOperatorChange: (branchId: string, conditionId: string, value: ConditionOperator) => void;
};

export const BranchConditionItem = ({
  branchId,
  condition,
  conditionIndex,
  operatorOptionsByType,
  variableOptions,
  typeItems,
  onRemoveCondition,
  onConditionTypeChange,
  onConditionFieldChange,
  onConditionOperatorChange,
}: BranchConditionItemProps) => {
  const { t } = useTranslation();
  const conditionType = (condition.operator.leftType ?? "string") as OperatorType;
  const operatorOptions = operatorOptionsByType[conditionType] ?? [];
  const operatorItems: SelectItem[] = operatorOptions.map((option) => ({
    value: option.value,
    name: option.label,
  }));

  const leftValue = String(condition.leftValue ?? "");
  const variableItems: SelectItem[] = [
    ...(!leftValue ? [{ value: "", name: t("workflow.conditions.selectVariable") }] : []),
    ...(leftValue && !variableOptions.some((option) => option.value === leftValue)
      ? [{ value: leftValue, name: leftValue, description: t("workflow.conditions.currentValue") }]
      : []),
    ...variableOptions.map((option) => ({
      value: option.value,
      name: option.label,
      description: option.description,
      group: option.group,
    })),
  ];

  const selectedOperator = operatorOptions.find((operator) => operator.value === condition.operator.operator);
  const isUnary = selectedOperator?.isUnary ?? Boolean(condition.operator.isUnary);

  return (
    <div className="group relative rounded-lg border border-gray-200/80 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-gray-700/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:hover:border-gray-600 dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {conditionIndex + 1}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("workflow.conditions.condition")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemoveCondition(branchId, condition.id)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
          aria-label={t("workflow.conditions.removeCondition")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 表单 - 三列布局 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 类型 */}
        <div>
          <SimpleSelect
            items={typeItems}
            defaultValue={conditionType}
            allowSearch={false}
            className={SELECT_CLASS_NAME}
            onSelect={(item) => onConditionTypeChange(branchId, condition.id, item.value as OperatorType)}
          />
        </div>

        {/* 左侧变量 */}
        <div>
          <SimpleSelect
            items={variableItems}
            defaultValue={leftValue}
            allowSearch={false}
            className={SELECT_CLASS_NAME}
            onSelect={(item) => onConditionFieldChange(branchId, condition.id, "leftValue", String(item.value))}
          />
        </div>

        {/* 操作符 */}
        <div>
          <SimpleSelect
            items={operatorItems}
            defaultValue={condition.operator.operator}
            allowSearch={false}
            className={SELECT_CLASS_NAME}
            onSelect={(item) => onConditionOperatorChange(branchId, condition.id, item.value as ConditionOperator)}
          />
        </div>

        {/* 右侧值（非一元操作符）- 占满一行 */}
        {!isUnary ? (
          <div className="col-span-3">
            <NodeInput
              value={String(condition.rightValue ?? "")}
              onChange={(event) => onConditionFieldChange(branchId, condition.id, "rightValue", event.target.value)}
              placeholder={t("workflow.conditions.rightValuePlaceholder")}
              className="py-1.5"
            />
          </div>
        ) : (
          <div className="col-span-3 rounded-md bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            {t("workflow.conditions.unaryOperatorHint")}
          </div>
        )}
      </div>
    </div>
  );
};