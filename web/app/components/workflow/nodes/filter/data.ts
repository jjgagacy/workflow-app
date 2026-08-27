import { NodeDefaultData } from "../../types";
import { createIfElseBranch } from "../if-else/data";
import type { ConditionBranch } from "../if-else/types";
import type { FilterNodeData } from "./types";

export const normalizeFilterBranches = (branches?: ConditionBranch[]) => {
  const branchList = (branches ?? []).filter(Boolean);
  const primaryBranch = branchList.find((branch) => !branch.isDefault) ?? branchList[0] ?? createIfElseBranch();

  return [
    {
      ...primaryBranch,
      isDefault: false,
      conditionGroup: primaryBranch.conditionGroup ?? {
        conditions: [],
        logicalOperator: 'and',
      },
    },
  ];
};

export const getFilterPrimaryBranch = (branches?: ConditionBranch[]) => normalizeFilterBranches(branches)[0];

export const filterNodeDefaultData: NodeDefaultData<FilterNodeData> = {
  value: {
    evaluationOptions: {
      caseSensitive: false,
      strictness: 'strict',
    },
    branches: normalizeFilterBranches([createIfElseBranch()]),
  },
  validate: function (payload: FilterNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    const conditions = getFilterPrimaryBranch(payload.branches).conditionGroup.conditions ?? [];

    if (conditions.length === 0) {
      return { valid: false, errorMessage: t('workflow.checkList.error.filterConditionMissing') };
    }

    for (let index = 0; index < conditions.length; index += 1) {
      const condition = conditions[index];

      if (!condition.variableSelector?.nodeId || !condition.variableSelector?.path?.length) {
        return {
          valid: false,
          errorMessage: t('workflow.checkList.error.filterVariableMissing', { index: index + 1 }),
        };
      }

      if (!condition.operator?.isUnary) {
        const rightValue = condition.rightValue;
        const isEmptyValue = rightValue === undefined || rightValue === null || rightValue === ''
          || (Array.isArray(rightValue) && rightValue.length === 0);

        if (isEmptyValue) {
          return {
            valid: false,
            errorMessage: t('workflow.checkList.error.filterValueMissing', { index: index + 1 }),
          };
        }
      }
    }

    return { valid: true };
  }
};