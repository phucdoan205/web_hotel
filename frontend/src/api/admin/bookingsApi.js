// src/api/admin/bookingsApi.js
import apiClient from "../client";

export const bookingsApi = {
  // Lấy danh sách booking với filter & phân trang
  getBookings: async (params = {}) => {
    const response = await apiClient.get("/Bookings", { params });
    return response.data;
  },

  getArrivals: async (params = {}) => {
    const response = await apiClient.get("/Bookings/arrivals", { params });
    return response.data;
  },
  getInHouse: async (params = {}) => {
    const response = await apiClient.get("/Bookings/in-house", { params });
    return response.data;
  },
  getDepartures: async (params = {}) => {
    const response = await apiClient.get("/Bookings/departures", { params });
    return response.data;
  },

  // Lấy chi tiết một booking
  getBookingById: async (id) => {
    const response = await apiClient.get(`/Bookings/${id}`);
    return response.data;
  },

  // Tạo booking mới
  createBooking: async (payload) => {
    const response = await apiClient.post("/Bookings", payload);
    return response.data;
  },

  // Cập nhật trạng thái booking (PATCH)
  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/Bookings/${id}/status`, { status });
    return response.data;
  },

  // Chuyển đổi phòng (Change Room)
  changeRoom: async (bookingId, payload) => {
    const response = await apiClient.put(`/Bookings/${bookingId}/change-room`, payload);
    return response.data;
  },
  
  // Huỷ booking
  cancelBooking: async (bookingId) => {
    const response = await apiClient.patch(`/Bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Check-in
  checkIn: async (bookingId) => {
    const response = await apiClient.patch(`/Bookings/${bookingId}/check-in`);
    return response.data;
  },

  // Check-out
  checkOut: async (bookingId) => {
    const response = await apiClient.patch(`/Bookings/${bookingId}/check-out`);
    return response.data;
  },
};