import { NodeDefaultData } from "../../types";
import { Condition, ConditionBranch, ConditionOperator, IfElseNodeData } from "./types";

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getIfElseBranchDefaultName = (branchIndex: number, isDefault?: boolean) => {
  if (isDefault) {
    return 'Else';
  }

  return branchIndex === 0 ? 'If' : `Elif ${branchIndex}`;
};

const isAutoBranchName = (name?: string) => {
  if (!name) {
    return true;
  }

  return /^(If|Else|Else If \d+|Elif \d+)$/i.test(name.trim());
};

export const createIfElseCondition = (): Condition => ({
  id: createId('condition'),
  leftValue: '',
  operator: {
    leftType: 'string',
    operator: ConditionOperator.StringEquals,
    rightType: 'string',
  },
  rightValue: '',
});

export const createIfElseBranch = (): ConditionBranch => ({
  id: createId('branch'),
  conditionGroup: {
    conditions: [createIfElseCondition()],
    logicalOperator: 'and',
  },
  logicalOperator: 'and',
});

export const createIfElseElseBranch = (): ConditionBranch => ({
  id: createId('else'),
  name: 'Else',
  conditionGroup: {
    conditions: [],
    logicalOperator: 'and',
  },
  logicalOperator: 'and',
  isDefault: true,
});

export const normalizeIfElseBranches = (branches?: ConditionBranch[]) => {
  const branchList = (branches ?? []).filter(Boolean);
  const branchesWithoutElse = branchList.filter(branch => !branch.isDefault);
  const elseBranch = branchList.find(branch => branch.isDefault) ?? createIfElseElseBranch();

  return [
    ...branchesWithoutElse.map((branch, index) => ({
      ...branch,
      name: isAutoBranchName(branch.name)
        ? getIfElseBranchDefaultName(index, false)
        : branch.name?.trim(),
    })),
    {
      ...elseBranch,
      name: isAutoBranchName(elseBranch.name)
        ? getIfElseBranchDefaultName(branchesWithoutElse.length, true)
        : elseBranch.name?.trim(),
      isDefault: true,
      conditionGroup: elseBranch.conditionGroup ?? {
        conditions: [],
        logicalOperator: 'and',
      },
    },
  ];
};

export const ifElseNodeDefaultData: NodeDefaultData<IfElseNodeData> = {
  value: {
    evaluationOptions: {
      caseSensitive: false,
      strictness: 'strict',
    },
    branches: normalizeIfElseBranches([createIfElseBranch()]),
  }
};
