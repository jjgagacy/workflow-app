import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { CirclePlus, GitBranchPlus, Trash2 } from "lucide-react";
import { cn } from "@/utils/classnames";
import { useNodesUpdate } from "../../hooks/use-nodesUpdate";
import { useWorkflowStore } from "../../context";
import { Node, NodeType } from "../../types";
import { useOperators } from "../../hooks/use-operators";
import { TitleInput } from "../../panel/components/title-input";
import {
  Condition,
  ConditionBranch,
  ConditionOperator,
  IfElseNodeData,
  LogicalOperator,
  OperatorType,
} from "./types";
import {
  createIfElseBranch,
  createIfElseCondition,
  getIfElseBranchDefaultName,
  normalizeIfElseBranches,
} from "./data";

type IfElsePanelProps = {
  node: Node<IfElseNodeData>;
};

type OperatorOption = {
  label: string;
  value: ConditionOperator;
  type: OperatorType;
  isUnary: boolean;
};

type VariableOption = {
  label: string;
  value: string;
  group: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';
const selectClassName = `${inputClassName} pr-8`;

const readOperatorType = (operator: Record<string, any>) => {
  return (operator.leftType ?? operator.firstType ?? 'string') as OperatorType;
};

const readOperatorUnary = (operator: Record<string, any>) => {
  return Boolean(operator.isUnary ?? operator.singleValue);
};

const getBranchTitle = (branch: ConditionBranch, index: number) => {
  return branch.name?.trim() || getIfElseBranchDefaultName(index, branch.isDefault);
};

const IfElsePanel = ({ node }: IfElsePanelProps) => {
  const store = useStoreApi();
  const updateActivePanelNode = useWorkflowStore((state) => state.updateActivePanelNode);
  const { onNodeDataUpdate } = useNodesUpdate();
  const { operatorGroups } = useOperators();
  const branches = useMemo(() => normalizeIfElseBranches(node.data.branches), [node.data.branches]);
  const decisionBranchCount = branches.filter((branch) => !branch.isDefault).length;
  const nodes = store.getState().nodes as Node[];

  const variableOptions = useMemo<VariableOption[]>(() => {
    const environmentOptions = Object.keys(process.env)
      .filter((key) => key === 'NODE_ENV' || key.startsWith('NEXT_PUBLIC_'))
      .map((key) => ({
        label: key,
        value: `env.${key}`,
        group: 'Environment',
      }));

    const builtInOptions: VariableOption[] = [
      { label: 'Workflow input', value: 'input', group: 'Built-in' },
      { label: 'Current user', value: 'system.user', group: 'Built-in' },
      { label: 'Current time', value: 'system.time', group: 'Built-in' },
    ];

    const nodeOptions = nodes
      .filter((workflowNode) => workflowNode.id !== node.id && workflowNode.data.type !== NodeType.Start)
      .map((workflowNode) => ({
        label: workflowNode.data.label?.trim() || workflowNode.id,
        value: `nodes.${workflowNode.id}.output`,
        group: 'Node outputs',
      }));

    return [...builtInOptions, ...environmentOptions, ...nodeOptions];
  }, [node.id, nodes]);

  const variableOptionGroups = useMemo(() => {
    return variableOptions.reduce<Record<string, VariableOption[]>>((accumulator, option) => {
      if (!accumulator[option.group]) {
        accumulator[option.group] = [];
      }

      accumulator[option.group].push(option);
      return accumulator;
    }, {});
  }, [variableOptions]);

  const operatorOptionsByType = useMemo<Record<OperatorType, OperatorOption[]>>(() => {
    return operatorGroups.reduce((accumulator, group) => {
      accumulator[group.label] = group.operators.map((operator) => {
        const operatorRecord = operator as unknown as Record<string, any>;

        return {
          label: operator.name,
          value: operator.operator,
          type: readOperatorType(operatorRecord),
          isUnary: readOperatorUnary(operatorRecord),
        };
      });

      return accumulator;
    }, {} as Record<OperatorType, OperatorOption[]>);
  }, [operatorGroups]);

  const syncBranches = (nextBranches: ConditionBranch[]) => {
    const normalizedBranches = normalizeIfElseBranches(nextBranches);
    const nextNode = {
      ...node,
      data: {
        ...node.data,
        branches: normalizedBranches,
      },
    };

    updateActivePanelNode(nextNode);
    onNodeDataUpdate({
      id: node.id,
      data: {
        branches: normalizedBranches,
      },
    });
  };

  const updateBranch = (branchId: string, updater: (branch: ConditionBranch) => ConditionBranch) => {
    syncBranches(
      branches.map((branch) => {
        if (branch.id !== branchId) {
          return branch;
        }

        return updater(branch);
      }),
    );
  };

  const handleAddBranch = () => {
    const elseBranch = branches.find((branch) => branch.isDefault);
    const decisionBranches = branches.filter((branch) => !branch.isDefault);
    syncBranches([
      ...decisionBranches,
      createIfElseBranch(),
      ...(elseBranch ? [elseBranch] : []),
    ]);
  };

  const handleRemoveBranch = (branchId: string) => {
    syncBranches(branches.filter((branch) => branch.id !== branchId));
  };

  const handleBranchLogicalOperatorChange = (branchId: string, value: LogicalOperator) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      logicalOperator: value,
      conditionGroup: {
        ...branch.conditionGroup,
        logicalOperator: value,
      },
    }));
  };

  const handleBranchNameChange = (branchId: string, value: string, branchIndex: number, isDefault?: boolean) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      name: value || getIfElseBranchDefaultName(branchIndex, isDefault),
    }));
  };

  const handleConditionGroupOperatorToggle = (branchId: string, currentValue: LogicalOperator) => {
    handleBranchLogicalOperatorChange(branchId, currentValue === 'and' ? 'or' : 'and');
  };

  const handleAddCondition = (branchId: string) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: [...(branch.conditionGroup.conditions ?? []), createIfElseCondition()],
      },
    }));
  };

  const handleRemoveCondition = (branchId: string, conditionId: string) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: branch.conditionGroup.conditions.filter((condition) => condition.id !== conditionId),
      },
    }));
  };

  const updateCondition = (branchId: string, conditionId: string, updater: (condition: Condition) => Condition) => {
    updateBranch(branchId, (branch) => ({
      ...branch,
      conditionGroup: {
        ...branch.conditionGroup,
        conditions: branch.conditionGroup.conditions.map((condition) => {
          if (condition.id !== conditionId) {
            return condition;
          }

          return updater(condition);
        }),
      },
    }));
  };

  const handleConditionTypeChange = (branchId: string, conditionId: string, value: OperatorType) => {
    const nextOperator = operatorOptionsByType[value]?.[0];

    if (!nextOperator) {
      return;
    }

    updateCondition(branchId, conditionId, (condition) => ({
      ...condition,
      operator: {
        leftType: value,
        operator: nextOperator.value,
        rightType: nextOperator.isUnary ? undefined : value,
        isUnary: nextOperator.isUnary,
      },
      rightValue: nextOperator.isUnary ? undefined : condition.rightValue,
    }));
  };

  const handleConditionOperatorChange = (branchId: string, conditionId: string, value: ConditionOperator) => {
    updateCondition(branchId, conditionId, (condition) => {
      const currentType = (condition.operator.leftType ?? 'string') as OperatorType;
      const nextOperator = operatorOptionsByType[currentType]?.find((operator) => operator.value === value);

      return {
        ...condition,
        operator: {
          ...condition.operator,
          operator: value,
          rightType: nextOperator?.isUnary ? undefined : currentType,
          isUnary: nextOperator?.isUnary,
        },
        rightValue: nextOperator?.isUnary ? undefined : condition.rightValue,
      };
    });
  };

  const handleConditionFieldChange = (branchId: string, conditionId: string, key: 'leftValue' | 'rightValue', value: string) => {
    updateCondition(branchId, conditionId, (condition) => ({
      ...condition,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/20 px-4 py-3">
        <div className="text-sm font-semibold text-foreground">Branch logic</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          Rules run from top to bottom. Each branch adds one output handle on the node, and the last handle is always the default else path.
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-background px-2.5 py-1">
            {decisionBranchCount} decision {decisionBranchCount === 1 ? 'branch' : 'branches'}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1">
            {branches.length} output {branches.length === 1 ? 'handle' : 'handles'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {branches.map((branch, index) => {
          const isDefault = Boolean(branch.isDefault);
          const conditions = branch.conditionGroup.conditions ?? [];
          const disableRemoveBranch = !isDefault && decisionBranchCount <= 1;
          const branchTitle = getBranchTitle(branch, index);

          return (
            <section
              key={branch.id}
              className={cn(
                'rounded-xl bg-transparent px-1 py-2',
                isDefault && 'bg-muted/5',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <TitleInput
                    title={branchTitle}
                    onChange={(value) => handleBranchNameChange(branch.id, value, index, isDefault)}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {isDefault
                      ? 'Used when no previous branch matches.'
                      : 'Configure the conditions that must match before this path is taken.'}
                  </div>
                </div>
                {!isDefault ? (
                  <button
                    type="button"
                    disabled={disableRemoveBranch}
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Remove branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {!isDefault && disableRemoveBranch ? (
                <div className="mt-3 rounded-md bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  Keep at least one decision branch so the node always has an If path before Else.
                </div>
              ) : null}

              {!isDefault ? (
                <>
                  <div className="mt-4 grid grid-cols-[52px_minmax(0,1fr)] gap-3">
                    <div className="flex min-h-full flex-col items-center justify-center py-2">
                      <div className="w-px flex-1 bg-[var(--border)]/80" />
                      <button
                        type="button"
                        onClick={() => handleConditionGroupOperatorToggle(branch.id, branch.conditionGroup.logicalOperator)}
                        className="my-2 rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm ring-1 ring-[var(--border)] transition-colors hover:bg-muted/40"
                        aria-label={`Toggle branch logic, current ${branch.conditionGroup.logicalOperator.toUpperCase()}`}
                      >
                        {branch.conditionGroup.logicalOperator.toUpperCase()}
                      </button>
                      <div className="w-px flex-1 bg-[var(--border)]/80" />
                    </div>

                    <div className="min-w-0 space-y-2 rounded-2xl bg-muted/15 px-3 py-2">
                      {conditions.map((condition, conditionIndex) => {
                        const conditionType = (condition.operator.leftType ?? 'string') as OperatorType;
                        const operatorOptions = operatorOptionsByType[conditionType] ?? [];
                        const selectedOperator = operatorOptions.find((operator) => operator.value === condition.operator.operator);
                        const isUnary = selectedOperator?.isUnary ?? Boolean(condition.operator.isUnary);

                        return (
                          <div key={condition.id} className="rounded-xl bg-background px-3 py-3">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                Condition {conditionIndex + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCondition(branch.id, condition.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                                aria-label="Remove condition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="block">
                                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Type</div>
                                <select
                                  value={conditionType}
                                  onChange={(event) => handleConditionTypeChange(branch.id, condition.id, event.target.value as OperatorType)}
                                  className={selectClassName}
                                >
                                  {Object.keys(operatorOptionsByType).map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="block">
                                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Left variable</div>
                                <select
                                  value={String(condition.leftValue ?? '')}
                                  onChange={(event) => handleConditionFieldChange(branch.id, condition.id, 'leftValue', event.target.value)}
                                  className={selectClassName}
                                >
                                  {!String(condition.leftValue ?? '') && <option value="">Select a variable</option>}
                                  {String(condition.leftValue ?? '') && !variableOptions.some(option => option.value === String(condition.leftValue ?? '')) ? (
                                    <option value={String(condition.leftValue)}>{String(condition.leftValue)}</option>
                                  ) : null}
                                  {Object.entries(variableOptionGroups).map(([groupName, options]) => (
                                    <optgroup key={groupName} label={groupName}>
                                      {options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </label>

                              <label className="block md:col-span-2">
                                <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Operator</div>
                                <select
                                  value={condition.operator.operator}
                                  onChange={(event) => handleConditionOperatorChange(branch.id, condition.id, event.target.value as ConditionOperator)}
                                  className={selectClassName}
                                >
                                  {operatorOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              {!isUnary ? (
                                <label className="block md:col-span-2">
                                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Right value</div>
                                  <input
                                    value={String(condition.rightValue ?? '')}
                                    onChange={(event) => handleConditionFieldChange(branch.id, condition.id, 'rightValue', event.target.value)}
                                    placeholder="e.g. approved"
                                    className={inputClassName}
                                  />
                                </label>
                              ) : (
                                <div className="rounded-md bg-muted/20 px-3 py-2 text-sm text-muted-foreground md:col-span-2">
                                  This operator does not require a right-side value.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddCondition(branch.id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/70"
                  >
                    <CirclePlus className="h-4 w-4" />
                    Add condition
                  </button>
                </>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-background px-3 py-3 text-sm text-muted-foreground">
                  No conditions here. Anything that does not match the branches above will flow to this output handle.
                </div>
              )}
            </section>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddBranch}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
      >
        <GitBranchPlus className="h-4 w-4" />
        Add branch before else
      </button>
    </div>
  );
};

export default IfElsePanel;
