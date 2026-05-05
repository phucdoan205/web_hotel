import apiClient from "../client";

const normalizeService = (service = {}) => ({
  id: Number(service.id || 0),
  categoryId: service.categoryId ? Number(service.categoryId) : null,
  categoryName: service.categoryName || null,
  name: service.name || "",
  thumbnailUrl: service.thumbnailUrl || null,
  description: service.description || "",
  price: Number(service.price || 0),
  unit: service.unit || "",
  status: Boolean(service.status),
  images: Array.isArray(service.images) ? service.images : [],
});

const normalizeCategory = (category = {}) => ({
  id: Number(category.id || 0),
  name: category.name || "",
  iconUrl: category.iconUrl || null,
  status: Boolean(category.status),
});

const normalizeUsage = (item = {}) => ({
  id: Number(item.id || 0),
  orderServiceId: Number(item.orderServiceId || 0),
  bookingId: item.bookingId ? Number(item.bookingId) : null,
  bookingDetailId: item.bookingDetailId ? Number(item.bookingDetailId) : null,
  bookingCode: item.bookingCode || "",
  roomNumber: item.roomNumber || "--",
  roomName: item.roomName || "",
  guestName: item.guestName || "",
  serviceId: Number(item.serviceId || 0),
  serviceName: item.serviceName || "",
  quantity: Number(item.quantity || 0),
  unitPrice: Number(item.unitPrice || 0),
  lineTotal: Number(item.lineTotal || 0),
  usedAt: item.usedAt || null,
  paymentStatus: item.paymentStatus || "Unpaid",
});

const normalizeInHouseRoom = (item = {}) => ({
  bookingId: Number(item.bookingId || 0),
  bookingDetailId: Number(item.bookingDetailId || 0),
  bookingCode: item.bookingCode || "",
  roomNumber: item.roomNumber || "--",
  roomName: item.roomName || "",
  guestName: item.guestName || "",
  checkInDate: item.checkInDate || null,
  checkOutDate: item.checkOutDate || null,
});

export const servicesApi = {
  async getServices(params = {}) {
    const response = await apiClient.get("/Services", { params });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeService);
  },
  
  async getServiceDetail(id) {
    const response = await apiClient.get(`/Services/${id}`);
    return normalizeService(response.data);
  },

  async getInHouseRooms() {
    const response = await apiClient.get("/Services/in-house");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeInHouseRoom);
  },

  async getUsageHistory(params = {}) {
    const response = await apiClient.get("/Services/history", { params });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeUsage);
  },

  async applyService(payload) {
    const response = await apiClient.post("/Services/apply", payload);
    return normalizeUsage(response.data);
  },

  async createService(payload) {
    const response = await apiClient.post("/Services", payload);
    return normalizeService(response.data);
  },

  async updateService(id, payload) {
    const response = await apiClient.put(`/Services/${id}`, payload);
    return normalizeService(response.data);
  },

  async uploadImages(files, serviceName = "") {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    if (serviceName) formData.append("serviceName", serviceName);

    const response = await apiClient.post("/Services/upload-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.urls;
  },

  async deleteService(id) {
    await apiClient.delete(`/Services/${id}`);
  },

  async getServiceCategories() {
    const response = await apiClient.get("/ServiceCategories");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeCategory);
  },

  async createServiceCategory(payload) {
    const response = await apiClient.post("/ServiceCategories", payload);
    return normalizeCategory(response.data);
  },

  async updateServiceCategory(id, payload) {
    const response = await apiClient.put(`/ServiceCategories/${id}`, payload);
    return normalizeCategory(response.data);
  },

  async deleteServiceCategory(id) {
    await apiClient.delete(`/ServiceCategories/${id}`);
  },
};

export default servicesApi;
