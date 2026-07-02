import { useTranslation } from "react-i18next";
import { SimpleSelect } from "@/app/ui/select";
import DeleteButton from "../../../components/base/delete-button";
import { NodeInput } from "../../../components/base/node-input";
import type { ListOperatorCondition, ListStringConditionOperator, SelectItem } from "../types";

interface ConditionItemProps {
  condition: ListOperatorCondition;
  index: number;
  conditionOperatorItems: SelectItem[];
  onUpdate: (conditionId: string, patch: Partial<ListOperatorCondition>) => void;
  onRemove: (conditionId: string) => void;
}

export const ConditionItem = ({
  condition,
  index,
  conditionOperatorItems,
  onUpdate,
  onRemove,
}: ConditionItemProps) => {
  const { t } = useTranslation();
  const isUnary = condition.operator === 'is_empty' || condition.operator === 'is_not_empty';

  return (
    <div className="group relative rounded-lg border border-gray-200/80 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-gray-700/60 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:hover:border-gray-600 dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      {/* 头部：条件编号 + 删除按钮 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("workflow.nodes.list-operator.condition")}
          </span>
        </div>
        <DeleteButton
          onClick={() => onRemove(condition.id)}
          ariaLabel={t("workflow.nodes.list-operator.removeCondition")}
          size="sm"
        />
      </div>

      {/* 表单：操作符 + 比较值（两列布局） */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <SimpleSelect
            items={conditionOperatorItems}
            defaultValue={condition.operator}
            allowSearch={false}
            className="w-full"
            onSelect={(item) => onUpdate(condition.id, { operator: item.value as ListStringConditionOperator })}
          />
        </div>

        {!isUnary ? (
          <div>
            <NodeInput
              value={condition.value}
              onChange={(event) => onUpdate(condition.id, { value: event.target.value })}
              placeholder={t("workflow.nodes.list-operator.rightValuePlaceholder")}
              className="py-1.5"
            />
          </div>
        ) : (
          <div className="flex items-center rounded-md bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            {t("workflow.nodes.list-operator.unaryOperatorHint")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionItem;