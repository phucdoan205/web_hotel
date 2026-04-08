const STORAGE_KEY = "receptionist-booking-payment-state";

const readStore = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeStore = (store) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getBookingPaymentState = (booking) => {
  if (!booking?.id) {
    return {
      paidDetailIds: [],
      allPaid: false,
      hasAnyPayment: false,
    };
  }

  const store = readStore();
  const entry = store[String(booking.id)] || {};
  const paidDetailIds = Array.isArray(entry.paidDetailIds) ? entry.paidDetailIds : [];
  const detailIds = (booking.bookingDetails || []).map((detail) => detail.id).filter(Boolean);
  const allPaid =
    booking.status === "Confirmed" ||
    booking.status === "CheckedIn" ||
    booking.status === "Completed" ||
    (detailIds.length > 0 && detailIds.every((id) => paidDetailIds.includes(id)));

  return {
    paidDetailIds,
    allPaid,
    hasAnyPayment: allPaid || paidDetailIds.length > 0,
  };
};

export const isBookingDeleteLocked = (booking) => {
  const paymentState = getBookingPaymentState(booking);
  return (
    paymentState.hasAnyPayment ||
    booking?.status === "Confirmed" ||
    booking?.status === "CheckedIn" ||
    booking?.status === "Completed"
  );
};

export const isBookingDetailPaid = (booking, detailId) => {
  const paymentState = getBookingPaymentState(booking);
  return paymentState.allPaid || paymentState.paidDetailIds.includes(detailId);
};

export const markBookingDetailPaid = (bookingId, detailId) => {
  if (!bookingId || !detailId) return;

  const store = readStore();
  const key = String(bookingId);
  const entry = store[key] || { paidDetailIds: [] };
  const nextPaidIds = Array.from(new Set([...(entry.paidDetailIds || []), detailId]));

  store[key] = {
    ...entry,
    paidDetailIds: nextPaidIds,
  };

  writeStore(store);
};

export const markBookingAllPaid = (booking) => {
  if (!booking?.id) return;

  const detailIds = (booking.bookingDetails || []).map((detail) => detail.id).filter(Boolean);
  const store = readStore();
  store[String(booking.id)] = {
    paidDetailIds: detailIds,
  };
  writeStore(store);
};
