import api from "@/api"

export const createApp = () => {
  return api.app.useCreateApp();
}

export const updateApp = () => {
  return api.app.useUpdateApp();
}
