import { createMutationHook } from "@/hooks/use-graphql";
import { GET_MODEL_PROVIDERS } from "./queries";
import { ModelProvider } from "../types/model-provider";
import { PageInfo } from "../../types/page-info";

export type MarketplaceModelProvidersResponse = {
  data: ModelProvider[];
  pageInfo?: PageInfo;
};

export const useGetMarketplaceModelProviders = createMutationHook<
  { marketplaceModelProviderList: MarketplaceModelProvidersResponse },
  { excludes?: string[]; category?: string; query?: string },
  MarketplaceModelProvidersResponse
>(
  GET_MODEL_PROVIDERS,
  {
    transform: (data) => data.marketplaceModelProviderList
  }
);
