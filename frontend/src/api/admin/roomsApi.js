import apiClient from "../client";

const normalizePagedResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 10,
  totalPages: data?.totalPages ?? data?.TotalPages ?? 0,
});

export const roomsApi = {
  getRooms: async (params = {}) => {
    const response = await apiClient.get("/Rooms", { params });
    return normalizePagedResponse(response.data);
  },
  getAvailableRooms: async (params = {}) => {
    const response = await apiClient.get("/Rooms/available", { params });
    return normalizePagedResponse(response.data);
  },
  getRoomById: async (id) => {
    const response = await apiClient.get(`/Rooms/${id}`);
    return response.data;
  },
  createRoom: async (payload) => {
    const response = await apiClient.post("/Rooms", payload);
    return response.data;
  },
  bulkCreateRooms: async (payload) => {
    const response = await apiClient.post("/Rooms/bulk-create", payload);
    return response.data;
  },
  updateRoom: async (id, payload) => {
    const response = await apiClient.put(`/Rooms/${id}`, payload);
    return response.data;
  },
  deleteRoom: async (id) => {
    const response = await apiClient.delete(`/Rooms/${id}`);
    return response.data;
  },
  restoreRoom: async (id) => {
    const response = await apiClient.post(`/Rooms/${id}/restore`);
    return response.data;
  },
  cloneRoom: async (roomId, payload) => {
    const response = await apiClient.post(`/Rooms/${roomId}/clone`, payload);
    return response.data;
  },
  updateRoomStatus: async (id, status) => {
    const response = await apiClient.patch(`/Rooms/${id}/status`, { status });
    return response.data;
  },
  updateCleaningStatus: async (id, cleaningStatus) => {
    const response = await apiClient.patch(`/Rooms/${id}/cleaning-status`, {
      cleaningStatus,
    });
    return response.data;
  },
  getRoomAmenities: async (roomId) => {
    const response = await apiClient.get(`/Rooms/${roomId}/amenities`);
    return response.data;
  },
  addAmenity: async (roomId, amenityId) => {
    const response = await apiClient.post(`/Rooms/${roomId}/amenities/${amenityId}`);
    return response.data;
  },
  removeAmenity: async (roomId, amenityId) => {
    const response = await apiClient.delete(`/Rooms/${roomId}/amenities/${amenityId}`);
    return response.data;
  },
};
