'use client';

import { useGetModelProviderList, useGetModelsByModelType } from "@/api/graphql/model-provider/settings/model-provider";
import { ModelProviderInfo } from "@/api/graphql/model-provider/types/model-provider";
import { toast } from "@/app/ui/toast";
import { ModelProviderModels, ModelType } from "@/types/model";
import { getErrorMessage } from "@/utils/errors";
import { createContext, useContext, useEffect, useState } from "react";

export interface ModelProviderContextType {
  modelProviderList: ModelProviderInfo[];
  mutateModelProviderList: () => Promise<any>;
  enableBilling: boolean;
  modelProviderModels: ModelProviderModels[];
  mutateModelsByModelType: () => Promise<any>;
}

const ModelProviderContext = createContext<ModelProviderContextType>({
  modelProviderList: [],
  mutateModelProviderList: async () => { },
  enableBilling: false,
  modelProviderModels: [],
  mutateModelsByModelType: async () => { },
});

export function ModelProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [enableBilling, setEnableBilling] = useState<boolean>(false);
  const { modelProviders, mutate, error } = useGetModelProviderList();
  const { modelProviderModels, mutate: mutateModelsByModelType, error: modelsByModelTypeError } = useGetModelsByModelType({ modelType: ModelType.llm });

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    }
  }, [error]);

  return (
    <ModelProviderContext.Provider value={{
      modelProviderList: modelProviders || [],
      mutateModelProviderList: mutate,
      enableBilling,
      modelProviderModels: modelProviderModels || [],
      mutateModelsByModelType: mutateModelsByModelType
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
