import apiClient from "../client";

export const getMyProfile = async () => {
  const response = await apiClient.get("/UserProfile/my-profile");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  await apiClient.put("/UserProfile/update-profile", payload);
};

export const changeMyPassword = async (payload) => {
  await apiClient.put("/UserProfile/change-password", payload);
};

export const uploadMyAvatar = async (userId, file) => {
  const payload = new FormData();
  payload.append("file", file);

  if (userId) {
    payload.append("userId", String(userId));
  }

  const response = await apiClient.post("/UserProfile/upload-avatar", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
