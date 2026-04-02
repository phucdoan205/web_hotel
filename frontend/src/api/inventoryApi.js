import apiClient from "./client";

export const inventoryApi = {
  getByRoom: (roomId) => apiClient.get(`/RoomInventories/room/${roomId}`),
  create: (data) => apiClient.post("/RoomInventories", data),
  update: (id, data) => apiClient.put(`/RoomInventories/${id}`, data),
  remove: (id) => apiClient.delete(`/RoomInventories/${id}`),
  clone: (data) => apiClient.post("/RoomInventories/clone", data),
  bulkCreate: (items) => apiClient.post("/RoomInventories/bulk", items),
};

export const lossAndDamageApi = {
  getAll: () => apiClient.get("/LossAndDamages"),
  create: (data) => apiClient.post("/LossAndDamages", data),
  approve: (id) => apiClient.patch(`/LossAndDamages/${id}/approve`),
  reject: (id) => apiClient.patch(`/LossAndDamages/${id}/reject`),
  uploadImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/LossAndDamages/upload-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
