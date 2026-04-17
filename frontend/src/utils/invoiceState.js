import { parseVietnamDateValue } from "./vietnamTime";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const normalizeDiscountType = (value) => String(value || "").trim().toLowerCase();

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

  if (discountType.includes("percent") || discountType.includes("phần trăm") || discountType === "%") {
    return Math.min(subtotal, Math.round((subtotal * discountValue) / 100));
  }

  return Math.min(subtotal, discountValue);
};
