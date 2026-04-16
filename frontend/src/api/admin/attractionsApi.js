import apiClient from "../client";

export const getAttractions = async (params) => {
  const response = await apiClient.get("/Attractions", { params });
  return response.data;
};

export const createAttraction = async (payload) => {
  const response = await apiClient.post("/Attractions", payload);
  return response.data;
};

export const updateAttraction = async (attractionId, payload) => {
  await apiClient.put(`/Attractions/${attractionId}`, payload);
};

export const deleteAttraction = async (attractionId) => {
  await apiClient.delete(`/Attractions/${attractionId}`);
};
