import apiClient from "../client";

export const getAttraction = async (attractionId) => {
  const response = await apiClient.get(`/Attractions/${attractionId}`);
  return response.data;
};
export const getAttractions = async (params) => {
  const response = await apiClient.get("/Attractions", { params });
  return response.data;
};

export const getPublicAttractions = async (params) => {
  const response = await apiClient.get("/Attractions/public", { params });
  return response.data;
};

export const createAttraction = async (payload) => {
  const response = await apiClient.post("/Attractions", payload);
  return response.data;
};

export const updateAttraction = async (attractionId, payload) => {
  const response = await apiClient.put(`/Attractions/${attractionId}`, payload);
  return response.data;
};

export const uploadImages = async (files, attractionName = "") => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (attractionName) {
    formData.append("attractionName", attractionName);
  }

  const response = await apiClient.post("/Attractions/upload-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.urls || [];
};

export const deleteAttraction = async (attractionId) => {
  await apiClient.delete(`/Attractions/${attractionId}`);
};
