import { StateCreator } from "zustand";

export type WorkflowEnvType = "string" | "number" | "secret";

export type WorkflowEnvVariable = {
  id: string;
  type: WorkflowEnvType;
  name: string;
  value: string;
  description: string;
};

type WorkflowEnvInput = Omit<WorkflowEnvVariable, "id">;

export type EnvState = {
  envVariables: WorkflowEnvVariable[];
  addEnvVariable: (envVariable: WorkflowEnvInput) => WorkflowEnvVariable;
  updateEnvVariable: (id: string, envVariable: WorkflowEnvInput) => void;
  removeEnvVariable: (id: string) => void;
};

const createEnvId = () => {
  return `env_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const createInitialEnvVariables = (): WorkflowEnvVariable[] => {
  return Object.entries(process.env)
    .filter(([key]) => key === "NODE_ENV" || key.startsWith("NEXT_PUBLIC_"))
    .map(([name, value]) => ({
      id: `env_${name}`,
      type: "string" as const,
      name,
      value: String(value ?? ""),
      description: "",
    }));
};

export const createEnvState: StateCreator<EnvState> = (set) => ({
  envVariables: createInitialEnvVariables(),
  addEnvVariable: (envVariable) => {
    const nextEnvVariable = {
      id: createEnvId(),
      ...envVariable,
    };

    set((state) => ({
      envVariables: [...state.envVariables, nextEnvVariable],
    }));

    return nextEnvVariable;
  },
  updateEnvVariable: (id, envVariable) => set((state) => ({
    envVariables: state.envVariables.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        ...envVariable,
      };
    }),
  })),
  removeEnvVariable: (id) => set((state) => ({
    envVariables: state.envVariables.filter((item) => item.id !== id),
  })),
});