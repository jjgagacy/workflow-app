import { createContext, useContext } from 'react';

const ViewContext = createContext({});

export const useView = () => {
  return useContext(ViewContext);
};

import { ReactNode } from 'react';

type ViewProviderProps = {
  value: any;
  children: ReactNode;
};

export const ViewProvider = ({ value, children }: ViewProviderProps) => (
  <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
);
