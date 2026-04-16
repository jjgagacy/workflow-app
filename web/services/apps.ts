import api from "@/api"
import { CreateAppInput } from "@/api/graphql/app/types";

export const createApp = () => {
  return api.app.useCreateApp();
}
