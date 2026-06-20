import api from "@/api"

export const createApp = () => {
  return api.app.useCreateApp();
}

export const updateApp = () => {
  return api.app.useUpdateApp();
}

export const deleteApp = () => {
  const deleteMutation = api.app.useDeleteApp();
  return (appId: string) => {
    return deleteMutation({ appId });
  };
}

export const updateAppName = () => {
  const updateNameMutation = api.app.useUpdateAppName();
  return (appId: string, name: string) => {
    return updateNameMutation({ appId, name });
  };
}
