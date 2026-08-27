import { NodeDefaultData } from "../../types";
import { Condition, ConditionBranch, ConditionOperator, IfElseNodeData } from "./types";

const createId = (prefix: string) => `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

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
  },
  validate: function (payload: IfElseNodeData, t: any, data?: any): { valid: boolean; errorMessage?: string; } {
    const decisionBranches = normalizeIfElseBranches(payload.branches).filter((branch) => !branch.isDefault);

    for (const branch of decisionBranches) {
      const conditions = branch.conditionGroup.conditions ?? [];
      const branchName = branch.name || branch.id;

      if (conditions.length === 0) {
        return { valid: false, errorMessage: t('workflow.checkList.error.ifElseConditionMissing', { branch: branchName }) };
      }

      for (let index = 0; index < conditions.length; index += 1) {
        const condition = conditions[index];

        if (!condition.variableSelector?.nodeId || !condition.variableSelector?.path?.length) {
          return {
            valid: false,
            errorMessage: t('workflow.checkList.error.ifElseVariableMissing', { branch: branchName, index: index + 1 }),
          };
        }

        if (!condition.operator?.isUnary) {
          const rightValue = condition.rightValue;
          const isEmptyValue = rightValue === undefined || rightValue === null || rightValue === ''
            || (Array.isArray(rightValue) && rightValue.length === 0);

          if (isEmptyValue) {
            return {
              valid: false,
              errorMessage: t('workflow.checkList.error.ifElseValueMissing', { branch: branchName, index: index + 1 }),
            };
          }
        }
      }
    }

    return { valid: true };
  }
};
