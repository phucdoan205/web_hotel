import apiClient from "../client";

export const roomInventoriesApi = {
  getInventoryByRoom: async (roomId) => {
    const response = await apiClient.get(`/RoomInventories/room/${roomId}`);
    return response.data;
  },
  createInventory: async (payload) => {
    const response = await apiClient.post("/RoomInventories", payload);
    return response.data;
  },
  updateInventory: async (id, payload) => {
    const response = await apiClient.put(`/RoomInventories/${id}`, payload);
    return response.data;
  },
  deleteInventory: async (id) => {
    const response = await apiClient.delete(`/RoomInventories/${id}`);
    return response.data;
  },
  cloneInventory: async (payload) => {
    const response = await apiClient.post("/RoomInventories/clone", payload);
    return response.data;
  },
};
