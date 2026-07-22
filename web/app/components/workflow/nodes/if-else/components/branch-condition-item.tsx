import CascadeFilterMenu from "@/app/components/base/menu/cascade-filter-menu";
import type { CascadeFilterOption } from "@/app/components/base/menu/cascade-filter-menu/types";
import { SimpleSelect } from "@/app/ui/select";
import { Box, Calendar, CheckSquare, File, Hash, List, Type, X } from "lucide-react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { NodeInput } from "../../../components/base/node-input";
import type { OperatorOption } from "../hooks/use-if-else-operator-options";
import type { Condition, ConditionOperator, OperatorType } from "../types";
import type { SelectItem, VariableOption } from "./branch-list.types";

const TYPE_ICON_MAP: Record<OperatorType, ComponentType<{ className?: string }>> = {
  string: Type,
  number: Hash,
  datetime: Calendar,
  boolean: CheckSquare,
  array: List,
  object: Box,
  file: File,
  any: Box,
};

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

  const cascadeOptions: CascadeFilterOption[] = typeItems.map((item) => {
    const type = item.value as OperatorType;
    const optionsOfType = operatorOptionsByType[type] ?? [];

    return {
      key: type,
      name: item.name,
      icon: TYPE_ICON_MAP[type],
      operators: optionsOfType.map((option) => option.label),
    };
  });

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
  const cascadeValue = {
    type: conditionType,
    operator: selectedOperator?.label || String(condition.operator.operator),
  };

  return (
    <div className="group relative rounded-lg border border-gray-200/80 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-gray-700/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:hover:border-gray-600 dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      {/* 头部：条件序号与删除 */}
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

      {/* 表单垂直排布 */}
      <div className="flex flex-col gap-2.5">
        {/* 第一行：选择变量 和 类型操作符 并排平分 */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <SimpleSelect
            items={variableItems}
            defaultValue={leftValue}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => onConditionFieldChange(branchId, condition.id, "leftValue", String(item.value))}
          />
          <CascadeFilterMenu
            value={cascadeValue}
            options={cascadeOptions}
            className="w-full"
            onChange={({ type, operator }) => {
              const nextType = type as OperatorType;
              const nextOperator = (operatorOptionsByType[nextType] ?? []).find((item) => item.label === operator);

              if (nextOperator) {
                onConditionOperatorChange(branchId, condition.id, nextOperator.value as ConditionOperator);
                return;
              }

              onConditionTypeChange(branchId, condition.id, nextType);
            }}
          />
        </div>

        {/* 第二行：输入值（仅非一元操作符时显示，独占整行并撑满） */}
        {!isUnary && (
          <div className="w-full">
            <NodeInput
              value={String(condition.rightValue ?? "")}
              onChange={(event) => onConditionFieldChange(branchId, condition.id, "rightValue", event.target.value)}
              placeholder={t("workflow.conditions.rightValuePlaceholder")}
              className="w-full py-1.5"
            />
          </div>
        )}
      </div>
    </div>
  );
};