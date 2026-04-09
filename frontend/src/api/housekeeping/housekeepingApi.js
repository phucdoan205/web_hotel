import apiClient from "../client";

const normalizeTaskListResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  pendingCount: data?.pendingCount ?? data?.PendingCount ?? 0,
  inProgressCount: data?.inProgressCount ?? data?.InProgressCount ?? 0,
  completedCount: data?.completedCount ?? data?.CompletedCount ?? 0,
});

export const housekeepingApi = {
  getTasks: async (params = {}) => {
    const response = await apiClient.get("/Housekeeping/tasks", { params });
    return normalizeTaskListResponse(response.data);
  },
  getTaskDetail: async (roomId) => {
    const response = await apiClient.get(`/Housekeeping/tasks/${roomId}`);
    return response.data;
  },
  acceptTask: async (roomId) => {
    const response = await apiClient.post(`/Housekeeping/tasks/${roomId}/accept`);
    return response.data;
  },
  completeTask: async (roomId) => {
    const response = await apiClient.post(`/Housekeeping/tasks/${roomId}/complete`);
    return response.data;
  },
  reportInventoryIssue: async (payload) => {
    const formData = new FormData();
    formData.append("roomInventoryId", payload.roomInventoryId);
    formData.append("quantity", payload.quantity);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.imageFile) {
      formData.append("imageFile", payload.imageFile);
    }

    const response = await apiClient.post("/Housekeeping/inventory-issues", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
  reportInventoryIssueManual: async (payload) => {
    const formData = new FormData();
    formData.append("roomInventoryId", payload.roomInventoryId);
    formData.append("quantity", payload.quantity);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.imageFile) {
      formData.append("imageFile", payload.imageFile);
    }

    const response = await apiClient.post("/Housekeeping/inventory-issues/manual", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
  getInventoryReports: async () => {
    const response = await apiClient.get("/Housekeeping/inventory-reports");
    return response.data;
  },
};
