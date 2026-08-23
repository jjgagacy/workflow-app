import type { WorkflowEnvVariable } from "@/app/components/workflow/store/states/env";

export const maskSecretEnvVariables = (envs: Array<Record<string, any>> = []): WorkflowEnvVariable[] => {
  return envs.map((env) => {
    const normalized: WorkflowEnvVariable = {
      id: env.id ?? env.name ?? `env_${Math.random().toString(36).slice(2, 8)}`,
      type: (env.type ?? 'string') as WorkflowEnvVariable['type'],
      name: env.name ?? '',
      value: env.type === 'secret' ? '[__HIDDEN__]' : String(env.value ?? ''),
      description: env.description ?? '',
    };

    return normalized;
  });
};
