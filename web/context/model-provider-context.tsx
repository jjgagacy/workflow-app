'use client';

import { useGetModelProviderList } from "@/api/graphql/model-provider/settings/model-provider";
import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { toast } from "@/app/ui/toast";
import { getErrorMessage } from "@/utils/errors";
import { createContext, useContext, useEffect, useState } from "react";

export interface ModelProviderContextType {
  modelProviderList: ModelProviderInfo[];
  mutateModelProviderList: () => Promise<any>;
  enableBilling: boolean;
}

const ModelProviderContext = createContext<ModelProviderContextType>({
  modelProviderList: [],
  mutateModelProviderList: async () => { },
  enableBilling: false
});

export function ModelProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [enableBilling, setEnableBilling] = useState<boolean>(false);
  const { modelProviders, mutate, error } = useGetModelProviderList();

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    }
  }, [error]);

  return (
    <ModelProviderContext.Provider value={{
      modelProviderList: modelProviders || [],
      mutateModelProviderList: mutate,
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
