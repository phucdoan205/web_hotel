import apiClient from "../client";

export const getCategories = async () => {
  const response = await apiClient.get("/ArticleCategories");
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await apiClient.post("/ArticleCategories", payload);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/ArticleCategories/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/ArticleCategories/${id}`);
  return response.data;
};

export const toggleCategoryStatus = async (id) => {
  const response = await apiClient.patch(`/ArticleCategories/${id}/status`);
  return response.data;
};
