import apiClient from "../client";

export const getMemberships = async () => {
  const response = await apiClient.get("/Memberships");
  return response.data;
};

export const createMembership = async (payload) => {
  const response = await apiClient.post("/Memberships", payload);
  return response.data;
};

export const updateMembership = async (id, payload) => {
  const response = await apiClient.put(`/Memberships/${id}`, payload);
  return response.data;
};

export const deleteMembership = async (id) => {
  const response = await apiClient.delete(`/Memberships/${id}`);
  return response.data;
};
