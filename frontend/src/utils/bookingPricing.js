const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getBookingDetailNights = (detail) => {
  const checkIn = detail?.checkInDate ? new Date(detail.checkInDate) : null;
  const checkOut = detail?.checkOutDate ? new Date(detail.checkOutDate) : null;

  if (!checkIn || !checkOut) return 1;

  return Math.max(1, Math.ceil((checkOut - checkIn) / MS_PER_DAY));
};

export const getBookingDetailTotal = (detail) =>
  (detail?.pricePerNight || 0) * getBookingDetailNights(detail);

export const getBookingDetailDeposit = (detail) => detail?.pricePerNight || 0;

export const getBookingTotalAmount = (bookingDetails = []) =>
  bookingDetails.reduce((sum, detail) => sum + getBookingDetailTotal(detail), 0);

export const getBookingDepositAmount = (bookingDetails = []) =>
  bookingDetails.reduce((sum, detail) => sum + getBookingDetailDeposit(detail), 0);
