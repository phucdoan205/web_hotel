const STATUS_LABELS = {
  Pending: "Pending",
  Confirmed: "Đã đặt thành công",
  CheckedIn: "Đã nhận phòng",
  CheckedOut: "Đã trả phòng",
  Completed: "Đã thanh toán",
  Cancelled: "Cancelled",
};

const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  CheckedIn: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  CheckedOut: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  Completed: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export const resolveUserBookingStatus = (booking) => {
  if (!booking) return "Pending";
  if (booking.status === "Cancelled" || booking.status === "Completed") {
    return booking.status;
  }

  const detailStatuses = (booking.bookingDetails || []).map((detail) => detail?.status).filter(Boolean);

  if (detailStatuses.some((status) => status === "CheckedIn")) return "CheckedIn";
  if (detailStatuses.some((status) => status === "CheckedOut")) return "CheckedOut";
  if (detailStatuses.every((status) => status === "Completed")) return "Completed";
  if (detailStatuses.some((status) => status === "Confirmed")) return "Confirmed";
  if (detailStatuses.every((status) => status === "Cancelled")) return "Cancelled";

  return booking.status || "Pending";
};

export const getUserBookingStatusLabel = (status) => STATUS_LABELS[status] || status || "Unknown";

export const getUserBookingStatusClassName = (status) =>
  STATUS_CLASSES[status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

export const canUserCancelBooking = (booking) => {
  const status = resolveUserBookingStatus(booking);
  return status === "Pending" && (booking?.bookingDetails || []).every((detail) => detail?.status === "Pending");
};

export const canUserPayBooking = (booking) => {
  const status = resolveUserBookingStatus(booking);
  return !["Cancelled", "Completed", "CheckedIn", "CheckedOut"].includes(status) &&
    (booking?.bookingDetails || []).some((detail) => detail?.status === "Pending");
};
