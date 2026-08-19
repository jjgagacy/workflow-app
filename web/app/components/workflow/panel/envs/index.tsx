import { useWorkflowStore } from "../../context";
import { WorkflowEnvType } from "../../store/states/env";
import { VariablePanel } from "../variable-panel";

const ENV_TYPE_OPTIONS: Array<{ value: WorkflowEnvType; label: string }> = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "secret", label: "Secret" },
];

export const EnvPanel = () => {
  const envVariables = useWorkflowStore((state) => state.envVariables);
  const addEnvVariable = useWorkflowStore((state) => state.addEnvVariable);
  const updateEnvVariable = useWorkflowStore((state) => state.updateEnvVariable);
  const removeEnvVariable = useWorkflowStore((state) => state.removeEnvVariable);
  return (
    <VariablePanel
      title="Environment variables"
      emptyText="No environment variables yet."
      addButtonText="Add variable"
      dialogTitle={{
        create: "Add environment variable",
        edit: "Edit environment variable",
      }}
      dialogDescription="Set the type, name, value and description for this workflow variable."
      typeOptions={ENV_TYPE_OPTIONS}
      variables={envVariables}
      addVariable={addEnvVariable}
      updateVariable={updateEnvVariable}
      removeVariable={removeEnvVariable}
      maskSecret
      validateValue={(type, value) => {
        if (type === "number" && value.trim() !== "" && Number.isNaN(Number(value))) {
          return "Number variables must have a numeric value.";
        }

        return "";
      }}
    />
  );
};

export default EnvPanel;