import client from "../client";

export const getPublicCategories = async () => {
  const response = await client.get("/public-services/categories");
  return response.data;
};

export const getPublicServices = async (params) => {
  const response = await client.get("/public-services", { params });
  return response.data;
};

export const getPublicServiceDetail = async (id) => {
  const response = await client.get(`/public-services/${id}`);
  return response.data;
};

export const createServiceComment = async (id, data) => {
  const response = await client.post(`/public-services/${id}/comments`, data);
  return response.data;
};

export default {
  getPublicCategories,
  getPublicServices,
  getPublicServiceDetail,
  createServiceComment,
};
