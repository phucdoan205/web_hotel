import apiClient, { API_BASE_URL } from "../client";

export const getNotifications = async (take = 10) => {
  const response = await apiClient.get("/Notifications", {
    params: { take },
  });

  return response.data ?? [];
};

export const markAllNotificationsRead = async () => {
  await apiClient.put("/Notifications/mark-all-read");
};

export const createNotificationStreamUrl = () =>
  `${API_BASE_URL}/Notifications/stream`;
