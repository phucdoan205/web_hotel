import apiClient from "../client";

export const loginWithEmail = async (payload) => {
  const response = await apiClient.post("/Auth/login", payload);
  return response.data;
};

export const loginWithGoogle = async (payload) => {
  const response = await apiClient.post("/Auth/google-login", payload);
  return response.data;
};

export const registerWithEmail = async (payload) => {
  const response = await apiClient.post("/Auth/register", payload);
  return response.data;
};

export const checkRegisterEmailExists = async (email) => {
  const response = await apiClient.get("/Auth/check-email", {
    params: { email },
  });
  return response.data;
};
