import apiClient from "../client";

const normalizePagedResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 10,
  totalPages: data?.totalPages ?? data?.TotalPages ?? 0,
});

export const roomTypesApi = {
  getPublicRoomTypes: async (params = {}) => {
    const response = await apiClient.get("/RoomTypes/public", { params });
    return normalizePagedResponse(response.data);
  },
};
