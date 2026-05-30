import { ArrowDown, ArrowUp, CirclePlus, Trash2 } from "lucide-react";
import { cn } from "@/utils/classnames";
import { TitleInput } from "../../../panel/components/title-input";
import type { OperatorOption } from "../hooks/use-if-else-operator-options";
import { ConditionBranch, ConditionOperator, OperatorType } from "../types";
import { getBranchTitle } from "../utils";

type VariableOption = {
  label: string;
  value: string;
  group: string;
};

type IfElseBranchListProps = {
  branches: ConditionBranch[];
  decisionBranchCount: number;
  operatorOptionsByType: Record<OperatorType, OperatorOption[]>;
  variableOptions: VariableOption[];
  variableOptionGroups: Record<string, VariableOption[]>;
  inputClassName: string;
  selectClassName: string;
  handleBranchNameChange: (branchId: string, value: string, branchIndex: number, isDefault?: boolean) => void;
  handleMoveBranch: (branchId: string, direction: "up" | "down") => void;
  handleRemoveBranch: (branchId: string) => void;
  handleConditionGroupOperatorToggle: (branchId: string, currentValue: ConditionBranch["conditionGroup"]["logicalOperator"]) => void;
  handleRemoveCondition: (branchId: string, conditionId: string) => void;
  handleConditionTypeChange: (branchId: string, conditionId: string, value: OperatorType) => void;
  handleConditionFieldChange: (branchId: string, conditionId: string, key: "leftValue" | "rightValue", value: string) => void;
  handleConditionOperatorChange: (branchId: string, conditionId: string, value: ConditionOperator) => void;
  handleAddCondition: (branchId: string) => void;
};

export const IfElseBranchList = ({
  branches,
  decisionBranchCount,
  operatorOptionsByType,
  variableOptions,
  variableOptionGroups,
  inputClassName,
  selectClassName,
  handleBranchNameChange,
  handleMoveBranch,
  handleRemoveBranch,
  handleConditionGroupOperatorToggle,
  handleRemoveCondition,
  handleConditionTypeChange,
  handleConditionFieldChange,
  handleConditionOperatorChange,
  handleAddCondition,
}: IfElseBranchListProps) => {
  return (
    <div className="mt-4 space-y-4">
      {branches.map((branch, index) => {
        const isDefault = Boolean(branch.isDefault);
        const conditions = branch.conditionGroup.conditions ?? [];
        const disableRemoveBranch = !isDefault && decisionBranchCount <= 1;
        const disableMoveUp = !isDefault && index === 0;
        const disableMoveDown = !isDefault && index === decisionBranchCount - 1;
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={disableMoveUp}
                    onClick={() => handleMoveBranch(branch.id, 'up')}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Move branch up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disableMoveDown}
                    onClick={() => handleMoveBranch(branch.id, 'down')}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Move branch down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={disableRemoveBranch}
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    aria-label="Remove branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>

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
                                {String(condition.leftValue ?? '') && !variableOptions.some((option) => option.value === String(condition.leftValue ?? '')) ? (
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
  );
};