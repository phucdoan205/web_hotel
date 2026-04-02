import apiClient from "./client";

export const roomsApi = {
  getAll: (params) => apiClient.get("/Rooms", { params }),
  patchStatus: (roomId, status) =>
    apiClient.patch(`/Rooms/${roomId}/status`, { status }),
};
