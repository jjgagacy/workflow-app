import { useMemo } from "react";
import { useStoreApi } from "@xyflow/react";
import { GitBranchPlus } from "lucide-react";
import { useIfElseBranchHandlers, useIfElseOperatorOptions } from "@/app/components/workflow/nodes/if-else/hooks";
import { IfElseBranchList } from "@/app/components/workflow/nodes/if-else/components";
import { useWorkflowStore } from "../../context";
import { Node, NodeType } from "../../types";
import { IfElseNodeData } from "./types";
import {
  normalizeIfElseBranches,
} from "./data";

type IfElsePanelProps = {
  node: Node<IfElseNodeData>;
};

type VariableOption = {
  label: string;
  value: string;
  group: string;
};

const inputClassName = 'w-full rounded-md border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60';
const selectClassName = `${inputClassName} pr-8`;

const IfElsePanel = ({ node }: IfElsePanelProps) => {
  const store = useStoreApi();
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const { operatorOptionsByType } = useIfElseOperatorOptions();
  const branches = useMemo(() => normalizeIfElseBranches(node.data.branches), [node.data.branches]);
  const {
    handleAddBranch,
    handleRemoveBranch,
    handleMoveBranch,
    handleBranchNameChange,
    handleConditionGroupOperatorToggle,
    handleAddCondition,
    handleRemoveCondition,
    handleConditionTypeChange,
    handleConditionOperatorChange,
    handleConditionFieldChange,
  } = useIfElseBranchHandlers({ node, branches });
  const decisionBranchCount = branches.filter((branch) => !branch.isDefault).length;
  const nodes = store.getState().nodes as Node[];

  const variableOptions = useMemo<VariableOption[]>(() => {
    const environmentOptions = envVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `env.${envVariable.name}`,
      group: 'Environment',
    }));

    const sessionOptions = chatEnvVariables.map((envVariable) => ({
      label: envVariable.name,
      value: `session.${envVariable.name}`,
      group: 'Session',
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

    return [...builtInOptions, ...environmentOptions, ...sessionOptions, ...nodeOptions];
  }, [chatEnvVariables, envVariables, node.id, nodes]);

  const variableOptionGroups = useMemo(() => {
    return variableOptions.reduce<Record<string, VariableOption[]>>((accumulator, option) => {
      if (!accumulator[option.group]) {
        accumulator[option.group] = [];
      }

      accumulator[option.group].push(option);
      return accumulator;
    }, {});
  }, [variableOptions]);

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

      <IfElseBranchList
        branches={branches}
        decisionBranchCount={decisionBranchCount}
        operatorOptionsByType={operatorOptionsByType}
        variableOptions={variableOptions}
        variableOptionGroups={variableOptionGroups}
        inputClassName={inputClassName}
        selectClassName={selectClassName}
        handleBranchNameChange={handleBranchNameChange}
        handleMoveBranch={handleMoveBranch}
        handleRemoveBranch={handleRemoveBranch}
        handleConditionGroupOperatorToggle={handleConditionGroupOperatorToggle}
        handleRemoveCondition={handleRemoveCondition}
        handleConditionTypeChange={handleConditionTypeChange}
        handleConditionFieldChange={handleConditionFieldChange}
        handleConditionOperatorChange={handleConditionOperatorChange}
        handleAddCondition={handleAddCondition}
      />

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
