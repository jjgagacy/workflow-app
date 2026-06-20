import { createMutationHook } from "@/hooks/use-graphql"
import { CreateAppInput, CreateAppResponse, UpdateAppInput } from "./types"
import { CREATE_APP, DELETE_APP, UPDATE_APP, UPDATE_APP_NAME } from "./mutations/app-mutation";

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

export const useDeleteApp = createMutationHook<
  { deleteApp: boolean },
  { appId: string },
  boolean
>(
  DELETE_APP,
  {
    transform: (data) => data.deleteApp,
  }
);

export const useUpdateAppName = createMutationHook<
  { updateAppName: boolean },
  { appId: string, name: string },
  boolean
>(
  UPDATE_APP_NAME,
  {
    transform: (data) => data.updateAppName,
  }
);
