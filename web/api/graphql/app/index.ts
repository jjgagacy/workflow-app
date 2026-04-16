import { createMutationHook } from "@/hooks/use-graphql"
import { CreateAppInput, CreateAppResponse } from "./types"
import { CREATE_APP } from "./mutations/app-mutation";

export const useCreateApp = createMutationHook<
  CreateAppResponse,
  { input: CreateAppInput },
  string
>(
  CREATE_APP,
  {
    transform: (data) => data.id
  }
);
