import axiosClient from "../client";

export const getPublicVouchers = () => axiosClient.get("/Vouchers/public");
export const getMyVouchers = () => axiosClient.get("/UserVouchers/my");
export const saveVoucher = (voucherId) => axiosClient.post(`/UserVouchers/save/${voucherId}`);
export const saveVoucherByCode = (code) => axiosClient.post(`/UserVouchers/save-by-code/${encodeURIComponent(code)}`);
