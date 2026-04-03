import apiClient from "../client";

export const getRoles = async () => {
  const response = await apiClient.get("/Roles");
  return response.data ?? [];
};
