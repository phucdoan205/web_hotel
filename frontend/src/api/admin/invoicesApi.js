import apiClient from "../client";

const normalizeInvoice = (invoice = {}) => ({
  id: invoice.id,
  bookingId: invoice.bookingId,
  detailId: invoice.bookingDetailId,
  voucherId: invoice.voucherId,
  code: invoice.code || "",
  bookingCode: invoice.bookingCode || "",
  guestName: invoice.guestName || "",
  roomNumber: invoice.roomNumber || "",
  roomName: invoice.roomName || "",
  roomRate: Number(invoice.roomRate || 0),
  checkInDate: invoice.checkInDate || null,
  checkOutDate: invoice.checkOutDate || null,
  stayedDays: Number(invoice.stayedDays || 0),
  subtotal: Number(invoice.totalRoomAmount || 0),
  totalServiceAmount: Number(invoice.totalServiceAmount || 0),
  discountAmount: Number(invoice.discountAmount || 0),
  taxAmount: Number(invoice.taxAmount || 0),
  totalAmount: Number(invoice.finalTotal || 0),
  status: invoice.status || "Pending",
  notes: invoice.notes || "",
  createdAt: invoice.createdAt || null,
  updatedAt: invoice.updatedAt || null,
  paidAt: invoice.paidAt || null,
  voucher: invoice.voucherCode
    ? {
        id: invoice.voucherId,
        code: invoice.voucherCode,
        discountType: invoice.voucherDiscountType,
        discountValue: Number(invoice.voucherDiscountValue || 0),
      }
    : null,
});

export const invoicesApi = {
  async getInvoices(params = {}) {
    const response = await apiClient.get("/Invoices", { params });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizeInvoice);
  },

  async getInvoiceById(id) {
    const response = await apiClient.get(`/Invoices/${id}`);
    return normalizeInvoice(response.data);
  },

  async createInvoice(payload) {
    const response = await apiClient.post("/Invoices", payload);
    return normalizeInvoice(response.data);
  },

  async completeInvoice(id, payload = {}) {
    const response = await apiClient.patch(`/Invoices/${id}/complete`, payload);
    return normalizeInvoice(response.data);
  },
};

export default invoicesApi;
