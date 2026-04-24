import apiClient from "../client";

const normalizeService = (service = {}) => ({
  id: Number(service.id || 0),
  name: service.name || "",
  price: Number(service.price || 0),
  unit: service.unit || "",
  status: Boolean(service.status),
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

const normalizeBookedRoom = (item = {}) => ({
  bookingId: Number(item.bookingId || 0),
  bookingDetailId: Number(item.bookingDetailId || 0),
  bookingCode: item.bookingCode || "",
  roomNumber: item.roomNumber || "--",
  roomName: item.roomName || "",
  guestName: item.guestName || "",
  checkInDate: item.checkInDate || null,
  checkOutDate: item.checkOutDate || null,
  bookingStatus: item.bookingStatus || "",
  detailStatus: item.detailStatus || "",
});

export const userServicesApi = {
  async getBookedRooms() {
    const response = await apiClient.get("/user-services/booked-rooms");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeBookedRoom);
  },

  async getServices() {
    const response = await apiClient.get("/user-services/catalog");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeService);
  },

  async getUsageHistory(params = {}) {
    const response = await apiClient.get("/user-services/history", { params });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeUsage);
  },

  async applyService(payload) {
    const response = await apiClient.post("/user-services/apply", payload);
    return normalizeUsage(response.data);
  },
};

export default userServicesApi;
