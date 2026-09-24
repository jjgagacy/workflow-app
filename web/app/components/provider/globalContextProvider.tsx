'use client';

import { SystemFeatures } from "@/types/feature"
import { create } from "zustand/react";
import Loading from "../base/loading";
import { useEffect } from "react";
import { useGetSystemFeatures } from "@/api/graphql/app/queries/features";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";

type GlobalContext = {
  pending: boolean;
  setPending: (pending: boolean) => void;
  systemFeatures: SystemFeatures;
  setSystemFeatures: (features: SystemFeatures) => void;
}

export const useGlobalContextStore = create<GlobalContext>(set => ({
  pending: true,
  setPending: (pending: boolean) => set({ pending }),
  systemFeatures: {} as SystemFeatures,
  setSystemFeatures: (features: SystemFeatures) => set({ systemFeatures: features }),
}));

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { pending, setSystemFeatures, setPending } = useGlobalContextStore();
  const getSystemFeatures = useGetSystemFeatures();

  const { data: features, isLoading, error } = getSystemFeatures();
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
      setSystemFeatures({} as SystemFeatures);
      setPending(false);
      return;
    }
    setSystemFeatures(features);
    setPending(false);
  }, [features, setSystemFeatures, error, setPending]);

  useEffect(() => {
    setPending(pending);
  }, [pending, setPending]);

  if (pending) {
    return (<div className="flex h-screen w-screen items-center justify-center"><Loading /></div>);
  }
  return (
    <>{children}</>
  );
};