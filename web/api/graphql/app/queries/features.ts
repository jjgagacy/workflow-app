import { createQueryHook } from "@/hooks/use-graphql";
import { SystemFeatures } from "@/types/feature";
import { GET_SYSTEM_FEATURES } from "../queries";

export type GetSystemFeaturesResponse = {
  systemFeatures: SystemFeatures;
};

export const useGetSystemFeatures = createQueryHook<
  GetSystemFeaturesResponse,
  { tenantId?: string },
  SystemFeatures
>(
  GET_SYSTEM_FEATURES,
  {
    transform: (data) => data?.systemFeatures,
  }
);
