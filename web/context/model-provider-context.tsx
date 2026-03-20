'use client';

import { useGetModelProviderList } from "@/api/graphql/model-provider/settings/model-provider";
import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { createContext, useContext, useEffect, useState } from "react";

export interface ModelProviderContextType {
  modelProviderList: ModelProviderInfo[];
  mutateModelProviderList: () => Promise<void>;
  enableBilling: boolean;
}

const ModelProviderContext = createContext<ModelProviderContextType>({
  modelProviderList: [],
  mutateModelProviderList: async () => { },
  enableBilling: false
});

export function ModelProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [modelProviderList, setModelProviderList] = useState<ModelProviderInfo[]>([]);
  const [mutateModelProviderList, setMutateModelProviderList] = useState<() => Promise<void>>(() => async () => { });
  const [enableBilling, setEnableBilling] = useState<boolean>(false);
  const { modelProviders, mutate, error } = useGetModelProviderList();

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    } else if (modelProviders) {
      setModelProviderList(modelProviders);
      setMutateModelProviderList(() => async () => {
        await mutate();
      });
    }
    // todo: billing
  }, [error, modelProviders, mutate]);

  return (
    <ModelProviderContext.Provider value={{
      modelProviderList,
      mutateModelProviderList,
      enableBilling
    }}>
      {children}
    </ModelProviderContext.Provider>
  );
}

export function useModelProviderContext() {
  const context = useContext(ModelProviderContext);
  if (context === undefined) {
    throw new Error('useModelProviderContext must be used within a ModelProviderContextProvider');
  }
  return context;
};
