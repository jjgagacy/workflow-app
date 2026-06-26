import { createQueryHook } from "@/hooks/use-graphql";
import { GetNodeDefaultConfigQueryVariables, GetNodeDefaultConfigResponse } from "./types/node-config.type";
import { GET_NODE_DEFAULT_CONFIG } from "./queries";

export const useGetNodeDefaultConfig = createQueryHook<
  { nodeTypeDefaultConfig: GetNodeDefaultConfigResponse },
  GetNodeDefaultConfigQueryVariables,
  GetNodeDefaultConfigResponse
>(
  GET_NODE_DEFAULT_CONFIG,
  {
    transform: (data) => { return data?.nodeTypeDefaultConfig; }
  }
);