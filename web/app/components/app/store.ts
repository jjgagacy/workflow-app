import { create } from "zustand"
import { Apps } from "./app.type"

type AppState = {
  appInfo: Apps | null,
  setAppInfo: (appInfo?: Apps) => void,
}

export const useAppStore = create<AppState>(set => ({
  appInfo: null,
  setAppInfo: (appInfo?: Apps) => set({ appInfo }),
}));

