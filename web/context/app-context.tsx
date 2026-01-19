'use client';

import api from "@/api";
import { toast } from "@/app/ui/toast";
import { AccountInfo } from "@/types/account";
import { getErrorMessage } from "@/utils/errors";
import { createContext, useContext, useEffect, useState } from "react";

export interface AppContextType {
  accountInfo: AccountInfo;
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
  const accountResponse = api.user.useAccountInfo();

  useEffect(() => {
    if (accountResponse) {
      if (accountResponse.error) {
        toast.error(getErrorMessage(accountResponse.error))
      } else {
        setAccountInfo(accountResponse.accountInfo)
      }
    }
  }, [accountResponse])

  return (
    <AppContext.Provider value={{ accountInfo }}>
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

