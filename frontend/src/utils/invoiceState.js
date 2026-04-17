import { parseVietnamDateValue } from "./vietnamTime";

const STORAGE_KEY = "admin-booking-invoice-state";
const EVENT_NAME = "admin-booking-invoice-state-change";
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const readStore = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (items) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
};

const normalizeDiscountType = (value) => String(value || "").trim().toLowerCase();

export const subscribeInvoiceState = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

export const calculateStayedDays = (checkInDate, currentValue = new Date()) => {
  const checkIn = parseVietnamDateValue(checkInDate);
  const current = parseVietnamDateValue(currentValue);

  if (!checkIn || !current) return 1;

  const diff = current.getTime() - checkIn.getTime();
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
};

export const isVoucherApplicable = (voucher, subtotal, currentValue = new Date()) => {
  if (!voucher || voucher.isDeleted || voucher.isActive === false) return false;

  const now = parseVietnamDateValue(currentValue) || new Date();
  const validFrom = parseVietnamDateValue(voucher.validFrom);
  const validTo = parseVietnamDateValue(voucher.validTo);
  const minBookingValue = Number(voucher.minBookingValue || 0);
  const usageLimit = Number(voucher.usageLimit || 0);
  const usageCount = Number(voucher.usageCount || 0);

  if (validFrom && now < validFrom) return false;
  if (validTo && now > validTo) return false;
  if (minBookingValue > 0 && subtotal < minBookingValue) return false;
  if (usageLimit > 0 && usageCount >= usageLimit) return false;

  return true;
};

export const calculateVoucherDiscount = (voucher, subtotal) => {
  if (!voucher || subtotal <= 0) return 0;

  const discountType = normalizeDiscountType(voucher.discountType);
  const discountValue = Number(voucher.discountValue || 0);

  if (discountValue <= 0) return 0;

  if (discountType.includes("percent") || discountType.includes("phan tram") || discountType === "%") {
    return Math.min(subtotal, Math.round((subtotal * discountValue) / 100));
  }

  return Math.min(subtotal, discountValue);
};

export const getStoredInvoices = () =>
  readStore().sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export const getStoredInvoiceById = (invoiceId) =>
  getStoredInvoices().find((invoice) => String(invoice.id) === String(invoiceId)) || null;

export const hasInvoiceForBookingDetail = (bookingId, detailId) =>
  getStoredInvoices().some(
    (invoice) =>
      String(invoice.bookingId) === String(bookingId) &&
      String(invoice.detailId) === String(detailId),
  );

export const createStoredInvoice = (invoicePayload) => {
  const items = readStore();
  const nextInvoice = {
    ...invoicePayload,
    id: invoicePayload.id || `INV-${Date.now()}`,
    status: invoicePayload.status || "Pending",
    createdAt: invoicePayload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore([nextInvoice, ...items]);
  return nextInvoice;
};

export const markInvoiceCompleted = (invoiceId) => {
  const items = readStore();
  let updatedInvoice = null;

  const nextItems = items.map((invoice) => {
    if (String(invoice.id) !== String(invoiceId)) return invoice;

    updatedInvoice = {
      ...invoice,
      status: "Completed",
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return updatedInvoice;
  });

  writeStore(nextItems);
  return updatedInvoice;
};
