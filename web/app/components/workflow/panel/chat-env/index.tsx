import { useWorkflowStore } from "../../context";
import { WorkflowChatEnvType } from "../../store/states/chat-env";
import { VariablePanel } from "../variable-panel";

const CHAT_ENV_TYPE_OPTIONS: Array<{ value: WorkflowChatEnvType; label: string }> = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "object", label: "Object" },
  { value: "any", label: "Any" },
];

const validateChatEnvValue = (type: WorkflowChatEnvType, value: string) => {
  const trimmedValue = value.trim();

  if (type === "number" && trimmedValue !== "" && Number.isNaN(Number(trimmedValue))) {
    return "Number variables must have a numeric value.";
  }

  if (type === "boolean" && trimmedValue !== "" && trimmedValue !== "true" && trimmedValue !== "false") {
    return "Boolean variables must be true or false.";
  }

  if (type === "object" && trimmedValue !== "") {
    try {
      const parsed = JSON.parse(trimmedValue);

      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return "Object variables must be a valid JSON object.";
      }
    } catch {
      return "Object variables must be a valid JSON object.";
    }
  }

  return "";
};

export const ChatEnvPanel = () => {
  const chatEnvVariables = useWorkflowStore((state) => state.chatEnvVariables);
  const addChatEnvVariable = useWorkflowStore((state) => state.addChatEnvVariable);
  const updateChatEnvVariable = useWorkflowStore((state) => state.updateChatEnvVariable);
  const removeChatEnvVariable = useWorkflowStore((state) => state.removeChatEnvVariable);

  return (
    <VariablePanel
      title="Session variables"
      emptyText="No session variables yet."
      addButtonText="Add variable"
      dialogTitle={{
        create: "Add session variable",
        edit: "Edit session variable",
      }}
      dialogDescription="Set the type, name, value and description for this session variable."
      typeOptions={CHAT_ENV_TYPE_OPTIONS}
      variables={chatEnvVariables}
      addVariable={addChatEnvVariable}
      updateVariable={updateChatEnvVariable}
      removeVariable={removeChatEnvVariable}
      validateValue={validateChatEnvValue}
    />
  );
};

export default ChatEnvPanel;