'use client';

import api from "@/api";
import { toast } from "@/app/ui/toast";
import { AccountInfo } from "@/types/account";
import { getErrorMessage } from "@/utils/errors";
import { createContext, useContext, useEffect, useState } from "react";

export interface AppContextType {
  accountInfo: AccountInfo;
  mutateAccountInfo?: () => void;
}

const defaultAccountInfo: AccountInfo = {
  id: '',
  username: '',
  mobile: '',
  roles: [],
  avatar: '',
  email: '',
  isSuper: false
}

const AppContext = createContext<AppContextType>({
  accountInfo: defaultAccountInfo
});

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>(defaultAccountInfo);
  const [mutateAccountInfo, setMutateAccountInfo] = useState<(() => Promise<void>) | undefined>();
  const { error, accountInfo: accountData, mutate } = api.user.useAccountInfo();

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    } else if (accountData) {
      setAccountInfo(accountData);
      setMutateAccountInfo(() => async () => {
        await mutate();
      });
    }
  }, [error, accountData, mutate]);

  return (
    <AppContext.Provider value={{ accountInfo, mutateAccountInfo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be within AppContextProvider');
  }
  return context;
}

