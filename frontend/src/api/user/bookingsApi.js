import apiClient from "../client";

const normalizePagedResponse = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 10,
  totalPages: data?.totalPages ?? data?.TotalPages ?? 0,
});

export const userBookingsApi = {
  getMyBookings: async (params = {}) => {
    const response = await apiClient.get("/user-bookings", { params });
    return normalizePagedResponse(response.data);
  },

  getMyBookingById: async (id) => {
    const response = await apiClient.get(`/user-bookings/${id}`);
    return response.data;
  },

  createBooking: async (payload) => {
    const response = await apiClient.post("/user-bookings", payload);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await apiClient.patch(`/user-bookings/${bookingId}/cancel`);
    return response.data;
  },

  confirmPayment: async (bookingId, payload = {}) => {
    const response = await apiClient.patch(`/user-bookings/${bookingId}/confirm-payment`, payload);
    return response.data;
  },

  checkOutBooking: async (bookingId) => {
    const response = await apiClient.patch(`/user-bookings/${bookingId}/check-out`);
    return response.data;
  },

  getPaymentSummary: async (bookingId, params = {}) => {
    const response = await apiClient.get(`/user-bookings/${bookingId}/payment-summary`, { params });
    return response.data;
  },

  completePayment: async (bookingId, payload = {}) => {
    const response = await apiClient.patch(`/user-bookings/${bookingId}/complete-payment`, payload);
    return response.data;
  },

  createMomoPayment: async (bookingId, payload) => {
    const response = await apiClient.post(`/user-bookings/${bookingId}/payments/momo`, payload);
    return response.data;
  },

  createCheckoutMomoPayment: async (bookingId, payload = {}) => {
    const response = await apiClient.post(`/user-bookings/${bookingId}/checkout-payments/momo`, payload);
    return response.data;
  },
};
