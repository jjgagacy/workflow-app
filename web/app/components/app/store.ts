import { create } from "zustand"
import { Apps } from "./app.type"

type AppState = {
  apps: Apps | null
}

export const useAppStore = create<AppState>(set => ({
  apps: null,
}));

