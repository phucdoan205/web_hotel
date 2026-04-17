import React, { useMemo, useState } from "react";
import { Calendar, CircleCheckBig, Clock, CreditCard, User, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import {
  getBookingDepositAmount,
  getBookingDetailDeposit,
  getBookingDetailTotal,
  getBookingTotalAmount,
} from "../../../utils/bookingPricing";
import { getBookingPaymentState, isBookingDetailPaid } from "../../../utils/bookingPaymentState";

const formatCurrency = (amount) => `${(amount || 0).toLocaleString("vi-VN")} đ`;

const getStatusStyle = (status) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "Cancelled":
      return "bg-rose-100 text-rose-700";
    case "CheckedIn":
      return "bg-sky-100 text-sky-700";
    case "Completed":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function BookingDetailModal({ open, onClose, booking, onBookingUpdated }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inlineMessage, setInlineMessage] = useState(null);

  const bookingDetails = useMemo(() => booking?.bookingDetails || [], [booking]);
  const paymentState = getBookingPaymentState(booking);
  const isCancelled = booking?.status === "Cancelled";
  const totalAmount = useMemo(() => getBookingTotalAmount(bookingDetails), [bookingDetails]);
  const depositAmount = useMemo(() => getBookingDepositAmount(bookingDetails), [bookingDetails]);

  const syncBookingQueries = (updatedBooking) => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["booking", String(updatedBooking.id)] });
    queryClient.invalidateQueries({ queryKey: ["confirmed-check-ins"] });
    queryClient.invalidateQueries({ queryKey: ["arrivals"] });
    queryClient.invalidateQueries({ queryKey: ["in-house"] });
    queryClient.invalidateQueries({ queryKey: ["departures"] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      const nextBooking = { ...booking, status: variables.status };
      syncBookingQueries(nextBooking);
      setInlineMessage({ type: "success", message: "Đã cập nhật trạng thái booking." });
      onBookingUpdated?.(nextBooking);
    },
    onError: () => {
      setInlineMessage({
        type: "warning",
        message: "Không thể cập nhật trạng thái booking lúc này.",
      });
    },
  });

  const handleOpenQrPage = (detailId) => {
    if (!booking?.id || isCancelled) return;

    const search = detailId ? `?detailId=${detailId}` : "";
    navigate(`/admin/bookings/${booking.id}/payment-qr${search}`);
  };

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gray-50 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Chi tiết Booking</h2>
            <p className="mt-1 text-sm text-gray-500">
              Mã: <span className="font-mono font-bold">{booking.bookingCode}</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded-2xl p-3 transition hover:bg-gray-200">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-[calc(95vh-210px)] space-y-8 overflow-y-auto px-8 py-8">
          {inlineMessage ? (
            <div
              className={`rounded-3xl border px-5 py-4 ${
                inlineMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <p className="font-bold">{inlineMessage.message}</p>
            </div>
          ) : null}

          <div>
            <div className="mb-4 flex items-center gap-3">
              <User className="text-orange-600" size={28} />
              <h3 className="text-lg font-bold text-gray-800">Thông tin khách hàng</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-6 text-sm">
              <div>
                <p className="text-gray-500">Tên khách</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.guestName || booking.guest?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Số điện thoại</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.guestPhone || booking.guest?.phone || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.guestEmail || booking.guest?.email || "—"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Calendar className="text-orange-600" size={28} />
                <h3 className="text-lg font-bold text-gray-800">Thông tin đặt phòng</h3>
              </div>
              {paymentState.depositComplete ? (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  <CircleCheckBig size={18} />
                  Đã thanh toán đủ
                </div>
              ) : null}
            </div>

            {bookingDetails.length > 0 ? (
              <div className="space-y-4">
                {bookingDetails.map((detail, index) => {
                  const detailPaid = isBookingDetailPaid(booking, detail.id);
                  const detailTotal = getBookingDetailTotal(detail);
                  const detailDeposit = getBookingDetailDeposit(detail);

                  return (
                    <div
                      key={detail.id || index}
                      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500">SỐ PHÒNG</p>
                          <p className="mt-1 text-2xl font-black text-gray-900">
                            {detail.room?.roomNumber || detail.roomNumber || "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">LOẠI PHÒNG</p>
                          <p className="mt-1 text-lg font-semibold">
                            {detail.roomTypeName || detail.roomType?.name || "—"}
                          </p>
                          {detailPaid ? (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              <CircleCheckBig size={14} />
                              Đã thanh toán QR
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500">CHECK-IN</p>
                          <p className="mt-1 font-semibold">
                            {detail.checkInDate
                              ? new Date(detail.checkInDate).toLocaleDateString("vi-VN")
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">CHECK-OUT</p>
                          <p className="mt-1 font-semibold">
                            {detail.checkOutDate
                              ? new Date(detail.checkOutDate).toLocaleDateString("vi-VN")
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between border-t pt-6 text-sm">
                        <span className="text-gray-600">Tổng tiền phòng</span>
                        <span className="font-semibold">{formatCurrency(detailTotal)}</span>
                      </div>

                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-gray-600">Thanh toán QR (1 đêm)</span>
                        <span className="font-black text-orange-600">{formatCurrency(detailDeposit)}</span>
                      </div>

                      {/* Payment actions removed from booking detail modal to avoid accidental payment marking.
                          Use the dedicated payment page to perform payments. */}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">Không có thông tin chi tiết phòng</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <Clock className="text-orange-600" size={28} />
              <div>
                <p className="text-gray-500">Trạng thái hiện tại</p>
                <span
                  className={`mt-2 inline-block rounded-2xl px-5 py-2 text-sm font-bold ${getStatusStyle(
                    booking.status,
                  )}`}
                >
                  {booking.status || "Unknown"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <CreditCard className="text-orange-600" size={28} />
              <div>
                <p className="text-gray-500">Tổng thanh toán tất cả</p>
                <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-orange-50 px-5 py-4">
            <p className="text-sm font-bold text-orange-700">Thanh toán QR để xác nhận booking</p>
            <p className="mt-2 text-2xl font-black text-orange-600">{formatCurrency(depositAmount)}</p>
            <p className="mt-1 text-sm text-orange-700">
              Thu trước 1 đêm cho mỗi phòng trong booking này.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-white px-8 py-5">
          <div className="flex flex-wrap justify-end gap-3">
            {/* Payment actions removed from booking detail modal footer. Use the payment page instead. */}
            <button
              onClick={onClose}
              className="rounded-2xl bg-gray-900 px-8 py-3 font-semibold text-white transition hover:bg-black"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
