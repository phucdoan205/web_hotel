import apiClient from "../client";

export const getStaffList = async (includeInactive = true) => {
  const response = await apiClient.get("/UserManagement/staff", {
    params: { includeInactive },
  });

  return response.data ?? [];
};

export const updateStaff = async (staffId, payload) => {
  const response = await apiClient.put(`/UserManagement/${staffId}`, payload);
  return response.data;
};

export const softDeleteStaff = async (staffId) => {
  await apiClient.delete(`/UserManagement/${staffId}`);
};

export const changeStaffRole = async (staffId, newRoleId) => {
  await apiClient.put(`/UserManagement/${staffId}/change-role`, {
    newRoleId,
  });
};

export const uploadUserAvatar = async (userId, file) => {
  const payload = new FormData();
  payload.append("file", file);
  payload.append("userId", String(userId));

  const response = await apiClient.post("/UserProfile/upload-avatar", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
