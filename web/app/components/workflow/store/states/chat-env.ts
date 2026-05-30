import { StateCreator } from "zustand";

export type WorkflowChatEnvType = "string" | "number" | "boolean" | "object" | "any";

export type WorkflowChatEnvVariable = {
  id: string;
  type: WorkflowChatEnvType;
  name: string;
  value: string;
  description: string;
};

type WorkflowChatEnvInput = Omit<WorkflowChatEnvVariable, "id">;

export type ChatEnvState = {
  chatEnvVariables: WorkflowChatEnvVariable[];
  addChatEnvVariable: (envVariable: WorkflowChatEnvInput) => WorkflowChatEnvVariable;
  updateChatEnvVariable: (id: string, envVariable: WorkflowChatEnvInput) => void;
  removeChatEnvVariable: (id: string) => void;
};

const createChatEnvId = () => {
  return `chat_env_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const createChatEnvState: StateCreator<ChatEnvState> = (set) => ({
  chatEnvVariables: [],
  addChatEnvVariable: (envVariable) => {
    const nextEnvVariable = {
      id: createChatEnvId(),
      ...envVariable,
    };

    set((state) => ({
      chatEnvVariables: [...state.chatEnvVariables, nextEnvVariable],
    }));

    return nextEnvVariable;
  },
  updateChatEnvVariable: (id, envVariable) => set((state) => ({
    chatEnvVariables: state.chatEnvVariables.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        ...envVariable,
      };
    }),
  })),
  removeChatEnvVariable: (id) => set((state) => ({
    chatEnvVariables: state.chatEnvVariables.filter((item) => item.id !== id),
  })),
});