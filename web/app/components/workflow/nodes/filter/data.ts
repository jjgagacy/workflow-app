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
  }
};