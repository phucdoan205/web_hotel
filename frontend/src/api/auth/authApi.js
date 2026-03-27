import apiClient from "../client";

export const loginWithEmail = async (payload) => {
  const response = await apiClient.post("/Auth/login", payload);
  return response.data;
};

export const loginWithGoogle = async (payload) => {
  const response = await apiClient.post("/Auth/google-login", payload);
  return response.data;
};
