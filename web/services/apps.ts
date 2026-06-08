import api from "@/api"

export const createApp = () => {
  return api.app.useCreateApp();
}
