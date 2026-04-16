import apiClient from "../client";

export const getRoles = async () => {
  const response = await apiClient.get("/Roles");
  return response.data ?? [];
};

export const getPermissions = async () => {
  const response = await apiClient.get("/Roles/permissions");
  return response.data ?? [];
};

export const getRolePermissions = async (roleId) => {
  const response = await apiClient.get(`/Roles/${roleId}/permissions`);
  return response.data;
};

export const updateRole = async (roleId, payload) => {
  await apiClient.put(`/Roles/${roleId}`, payload);
};

export const assignRolePermissions = async (payload) => {
  await apiClient.post("/Roles/assign-permission", payload);
};

export const deleteRole = async (roleId) => {
  await apiClient.delete(`/Roles/${roleId}`);
};
