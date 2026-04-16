import {
  isBookingDetailCheckedIn,
  isBookingDetailCheckedOut,
  isBookingDetailInvoiced,
} from "./bookingRoomFlowState";

export const getRoomEntryGuestName = (booking) =>
  booking.guestName || booking.guest?.name || "Khách chưa rõ tên";

export const getRoomEntryNumber = (detail) => detail?.room?.roomNumber || detail?.roomNumber || "--";

export const getRoomEntryName = (booking, detail) =>
  detail?.roomTypeName || detail?.roomType?.name || booking.roomTypeName || "Phòng";

export const getRoomEntryPrice = (booking, detail) =>
  detail?.pricePerNight ||
  detail?.room?.basePrice ||
  detail?.roomType?.basePrice ||
  detail?.basePrice ||
  booking.basePrice ||
  booking.totalAmount ||
  0;

export const buildBookingRoomEntries = (bookings = [], todayKey = "") =>
  bookings.flatMap((booking) =>
    (booking.bookingDetails || []).map((detail, index) => {
      const roomNumber = getRoomEntryNumber(detail);
      const checkOutKey = String(detail?.checkOutDate || "").slice(0, 10);
      const dueForCheckout = Boolean(checkOutKey && todayKey && checkOutKey <= todayKey);

      return {
        id: `${booking.id}-${detail.id || index}`,
        booking,
        detail,
        bookingId: booking.id,
        detailId: detail.id,
        bookingCode: booking.bookingCode,
        guestName: getRoomEntryGuestName(booking),
        roomNumber,
        roomName: getRoomEntryName(booking, detail),
        basePrice: getRoomEntryPrice(booking, detail),
        roomStatus: detail.room?.status || booking.roomStatus || "Occupied",
        cleaningStatus: detail.room?.cleaningStatus || booking.cleaningStatus || detail.cleaningStatus,
        checkInDate: detail.checkInDate,
        checkOutDate: detail.checkOutDate,
        checkedIn: isBookingDetailCheckedIn(booking.id, detail.id),
        checkedOut: isBookingDetailCheckedOut(booking.id, detail.id),
        invoiced: isBookingDetailInvoiced(booking.id, detail.id),
        dueForCheckout,
      };
    }),
  );
