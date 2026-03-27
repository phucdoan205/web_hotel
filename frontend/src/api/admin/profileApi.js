import apiClient from "../client";

export const getMyProfile = async () => {
  const response = await apiClient.get("/UserProfile/my-profile");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  await apiClient.put("/UserProfile/update-profile", payload);
};
