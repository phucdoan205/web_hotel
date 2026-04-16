const STORAGE_KEY = "receptionist-booking-room-flow-state";
const EVENT_NAME = "booking-room-flow-state-change";

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
  window.dispatchEvent(new Event(EVENT_NAME));
};

const getEntry = (bookingId) => {
  const store = readStore();
  return store[String(bookingId)] || {
    checkedInDetailIds: [],
    checkedOutDetailIds: [],
    invoicedDetailIds: [],
    checkedInSnapshots: {},
    checkedOutSnapshots: {},
  };
};

const updateEntry = (bookingId, updater) => {
  if (!bookingId) return;
  const store = readStore();
  const key = String(bookingId);
  const current = store[key] || {
    checkedInDetailIds: [],
    checkedOutDetailIds: [],
    invoicedDetailIds: [],
    checkedInSnapshots: {},
    checkedOutSnapshots: {},
  };
  store[key] = updater(current);
  writeStore(store);
};

export const subscribeBookingRoomFlowState = (callback) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

export const isBookingDetailCheckedOut = (bookingId, detailId) => {
  if (!bookingId || !detailId) return false;
  const entry = getEntry(bookingId);
  return (entry.checkedOutDetailIds || []).includes(detailId);
};

export const isBookingDetailCheckedIn = (bookingId, detailId) => {
  if (!bookingId || !detailId) return false;
  const entry = getEntry(bookingId);
  return (entry.checkedInDetailIds || []).includes(detailId);
};

export const isBookingDetailInvoiced = (bookingId, detailId) => {
  if (!bookingId || !detailId) return false;
  const entry = getEntry(bookingId);
  return (entry.invoicedDetailIds || []).includes(detailId);
};

export const markBookingDetailCheckedOut = (bookingId, detailId) => {
  if (!bookingId || !detailId) return;

  updateEntry(bookingId, (current) => ({
    ...current,
    checkedOutDetailIds: Array.from(new Set([...(current.checkedOutDetailIds || []), detailId])),
  }));
};

export const saveBookingDetailCheckedOutSnapshot = (bookingId, detailId, snapshot) => {
  if (!bookingId || !detailId || !snapshot) return;

  updateEntry(bookingId, (current) => ({
    ...current,
    checkedOutDetailIds: Array.from(new Set([...(current.checkedOutDetailIds || []), detailId])),
    checkedOutSnapshots: {
      ...(current.checkedOutSnapshots || {}),
      [String(detailId)]: snapshot,
    },
  }));
};

export const markBookingDetailInvoiced = (bookingId, detailId) => {
  if (!bookingId || !detailId) return;

  updateEntry(bookingId, (current) => ({
    ...current,
    invoicedDetailIds: Array.from(new Set([...(current.invoicedDetailIds || []), detailId])),
    checkedOutSnapshots: current.checkedOutSnapshots || {},
  }));
};

export const saveBookingDetailCheckedInSnapshot = (bookingId, detailId, snapshot) => {
  if (!bookingId || !detailId || !snapshot) return;

  updateEntry(bookingId, (current) => ({
    ...current,
    checkedInDetailIds: Array.from(new Set([...(current.checkedInDetailIds || []), detailId])),
    checkedInSnapshots: {
      ...(current.checkedInSnapshots || {}),
      [String(detailId)]: snapshot,
    },
  }));
};

export const getStoredCheckedInRoomEntries = () => {
  const store = readStore();

  return Object.entries(store).flatMap(([bookingId, entry]) => {
    const snapshots = entry?.checkedInSnapshots || {};

    return Object.entries(snapshots).map(([detailId, snapshot]) => ({
      ...snapshot,
      bookingId: Number(bookingId),
      detailId: Number(detailId),
      checkedIn: true,
      checkedOut: (entry?.checkedOutDetailIds || []).includes(Number(detailId)),
      invoiced: (entry?.invoicedDetailIds || []).includes(Number(detailId)),
    }));
  });
};

export const getStoredCheckedOutRoomEntries = () => {
  const store = readStore();

  return Object.entries(store).flatMap(([bookingId, entry]) => {
    const snapshots = entry?.checkedOutSnapshots || {};

    return Object.entries(snapshots).map(([detailId, snapshot]) => ({
      ...snapshot,
      bookingId: Number(bookingId),
      detailId: Number(detailId),
      checkedOut: true,
      invoiced: (entry?.invoicedDetailIds || []).includes(Number(detailId)),
    }));
  });
};

export const areAllBookingDetailsCheckedOut = (booking) => {
  const details = booking?.bookingDetails || [];
  if (details.length === 0 || !booking?.id) return false;
  return details.every((detail) => isBookingDetailCheckedOut(booking.id, detail.id));
};

export const areAllBookingDetailsCheckedIn = (booking) => {
  const details = booking?.bookingDetails || [];
  if (details.length === 0 || !booking?.id) return false;
  return details.every((detail) => isBookingDetailCheckedIn(booking.id, detail.id));
};
