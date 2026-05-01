import apiClient from "../client";

export const getCategories = async () => {
  const response = await apiClient.get("/ArticleCategories");
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await apiClient.post("/ArticleCategories", payload);
  return response.data;
};

// Note: Backend currently only supports Get and Create.
// I will add delete/update if needed by extending the backend later, 
// but for now let's stick to what's available.
