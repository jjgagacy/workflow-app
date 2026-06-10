import { createMutationHook } from "@/hooks/use-graphql"
import { CreateAppInput, CreateAppResponse, UpdateAppInput } from "./types"
import { CREATE_APP, UPDATE_APP } from "./mutations/app-mutation";

export const useCreateApp = createMutationHook<
  CreateAppResponse,
  { input: CreateAppInput },
  string
>(
  CREATE_APP,
  {
    transform: (data) => data.createApp.id,
  }
);

export const useUpdateApp = createMutationHook<
  { updateApp: boolean },
  { appId: string, input: UpdateAppInput },
  boolean
>(
  UPDATE_APP,
  {
    transform: (data) => data.updateApp,
  }
);
