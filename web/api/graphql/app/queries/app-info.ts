import { createQueryHook } from "@/hooks/use-graphql";
import { GET_APP_INFO } from "../queries";
import { AppInfo, GetAppInfoResponse } from "../types";

export const useGetAppInfo = createQueryHook<
  GetAppInfoResponse,
  { appId: string },
  AppInfo
>(
  GET_APP_INFO,
  {
    transform: (data) => { return data?.appInfo; }
  }
);
