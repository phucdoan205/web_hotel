import apiClient from "../client";

const normalizePagedResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 10,
  totalPages: data?.totalPages ?? data?.TotalPages ?? 0,
});

export const roomTypesApi = {
  getRoomTypes: async (params = {}) => {
    const response = await apiClient.get("/RoomTypes", { params });
    return normalizePagedResponse(response.data);
  },
  getRoomTypeById: async (id) => {
    const response = await apiClient.get(`/RoomTypes/${id}`);
    return response.data;
  },
  createRoomType: async (payload) => {
    const response = await apiClient.post("/RoomTypes", payload);
    return response.data;
  },
  updateRoomType: async (id, payload) => {
    const response = await apiClient.put(`/RoomTypes/${id}`, payload);
    return response.data;
  },
  uploadRoomTypeImage: async ({ file, roomTypeName }) => {
    const formData = new FormData();
    formData.append("file", file);
    if (roomTypeName) {
      formData.append("roomTypeName", roomTypeName);
    }

    const response = await apiClient.post("/RoomTypes/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
  deleteRoomType: async (id) => {
    const response = await apiClient.delete(`/RoomTypes/${id}`);
    return response.data;
  },
  restoreRoomType: async (id) => {
    const response = await apiClient.post(`/RoomTypes/${id}/restore`);
    return response.data;
  },
};
