import apiClient from "../client";

const base = "/vouchers";

export const listVouchers = (params) => apiClient.get(`${base}`, { params });
export const getVoucher = (id) => apiClient.get(`${base}/${id}`);
export const createVoucher = (payload) => apiClient.post(`${base}`, payload);
export const updateVoucher = (id, payload) => apiClient.put(`${base}/${id}`, payload);
export const softDeleteVoucher = (id) => apiClient.delete(`${base}/${id}`);
export const toggleActiveVoucher = (id) => apiClient.post(`${base}/${id}/toggle-active`);
export const sendVoucherToUsers = (payload) => apiClient.post(`${base}/send/users`, payload);
export const sendVoucherToBirthdays = (payload) =>
  apiClient.post(`${base}/send/birthdays`, payload);

export default {
  listVouchers,
  getVoucher,
  createVoucher,
  updateVoucher,
  softDeleteVoucher,
  toggleActiveVoucher,
  sendVoucherToUsers,
  sendVoucherToBirthdays,
};
