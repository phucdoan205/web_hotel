import apiClient, { API_BASE_URL } from "../client";
import { getStoredAuth } from "../../utils/authStorage";

const getCurrentUserId = () => getStoredAuth()?.userId ?? null;

export const getNotifications = async (take = 10) => {
  const userId = getCurrentUserId();
  const response = await apiClient.get("/Notifications", {
    params: {
      take,
      userId,
    },
  });

  return response.data ?? [];
};

export const markAllNotificationsRead = async () => {
  const userId = getCurrentUserId();
  await apiClient.put("/Notifications/mark-all-read", null, {
    params: { userId },
  });
};

export const createNotificationStreamUrl = () => {
  const userId = getCurrentUserId();
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";

  return `${API_BASE_URL}/Notifications/stream${query}`;
};
