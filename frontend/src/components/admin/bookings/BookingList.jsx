import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Eye,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import BookingDetailModal from "../../receptionist/bookings/BookingDetailModal";
import {
  getBookingPaymentState,
  isBookingDeleteLocked,
} from "../../../utils/bookingPaymentState";
import { hasPermission } from "../../../utils/permissions";
import { formatVietnamDate } from "../../../utils/vietnamTime";

const BookingList = ({ filters, onPageChange }) => {
  const canViewBookings = hasPermission("VIEW_BOOKINGS");
  const canDeleteBookings = hasPermission("DELETE_BOOKINGS");
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const response = await bookingsApi.getBookings({
        search: filters.search,
        status: filters.status,
        roomTypeId: filters.roomTypeId,
        checkInFrom: filters.checkInFrom,
        checkInTo: filters.checkInTo,
        page: filters.page,
        pageSize: filters.pageSize,
      });

      return response;
    },
    keepPreviousData: true,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setCancelTarget(null);
    },
    onError: (error) => {
      window.alert(`Hủy booking thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  const bookings = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize || 10));

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu booking</div>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="text-sm font-black uppercase tracking-widest text-gray-500">
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Ngày check-in</th>
                <th className="px-4 py-3 text-left">Loại phòng</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Chưa có booking nào
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const bookingDetails = booking.bookingDetails || [];
                  const paymentState = getBookingPaymentState(booking);
                  const deleteLocked = isBookingDeleteLocked(booking);

                  return (
                    <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 align-top text-sm font-bold text-blue-600">
                        <div>{booking.bookingCode}</div>
                        {bookingDetails.length > 1 ? (
                          <div className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">
                            {bookingDetails.length} phòng
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-sm font-semibold">
                        {booking.guestName || booking.guest?.name || "--"}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-gray-600">
                        <div className="space-y-2">
                          {bookingDetails.map((detail, index) => (
                            <div
                              key={`${booking.id}-date-${detail.id || index}`}
                              className="rounded-2xl bg-slate-50 px-3 py-2"
                            >
                              <div className="font-semibold text-slate-700">
                                {detail.checkInDate ? formatVietnamDate(detail.checkInDate) : "--"}
                              </div>
                              <div className="text-xs text-slate-500">
                                Phòng {detail.room?.roomNumber || detail.roomNumber || "--"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-sm">
                        <div className="space-y-2">
                          {bookingDetails.map((detail, index) => (
                            <div
                              key={`${booking.id}-room-${detail.id || index}`}
                              className="rounded-2xl bg-orange-50 px-3 py-2"
                            >
                              <div className="font-semibold text-slate-800">
                                {detail.roomTypeName || detail.roomType?.name || "--"}
                              </div>
                              <div className="text-xs text-orange-600">
                                Số phòng {detail.room?.roomNumber || detail.roomNumber || "--"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        <span
                          className={`inline-block rounded-full px-4 py-1 text-xs font-bold ${getStatusStyle(
                            booking.status,
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                        {paymentState.hasDeposit ? (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                            <CircleCheckBig size={12} />
                            Đã có đặt cọc
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          {canViewBookings ? (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsDetailOpen(true);
                              }}
                              className="rounded-xl p-2 text-sky-600 transition-all hover:bg-sky-100"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>
                          ) : null}

                          {!deleteLocked && canDeleteBookings ? (
                            <button
                              onClick={() => setCancelTarget(booking)}
                              className="rounded-xl p-2 text-red-600 transition-all hover:bg-red-100"
                              title="Hủy booking"
                            >
                              <Trash2 size={18} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-8 py-5">
          <p className="text-xs text-gray-500">
            Hiển thị {bookings.length} / {totalCount} booking
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="rounded-xl p-2 transition hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-sm font-medium">
              Trang {filters.page} / {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="rounded-xl p-2 transition hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {canViewBookings ? (
          <BookingDetailModal
            open={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            booking={selectedBooking}
            onBookingUpdated={(updatedBooking) => {
              setSelectedBooking(updatedBooking);
              queryClient.setQueryData(["bookings", filters], (oldData) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  items: oldData.items.map((item) =>
                    item.id === updatedBooking.id ? { ...item, ...updatedBooking } : item,
                  ),
                };
              });
            }}
          />
        ) : null}
      </div>

      {cancelTarget && canDeleteBookings ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <TriangleAlert size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Xác nhận hủy booking</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Bạn có chắc muốn hủy booking <span className="font-bold">{cancelTarget.bookingCode}</span> không?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Không
              </button>
              <button
                type="button"
                onClick={() => cancelMutation.mutate(cancelTarget.id)}
                disabled={cancelMutation.isPending}
                className="rounded-2xl bg-rose-600 px-4 py-2 font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {cancelMutation.isPending ? "Đang hủy..." : "Có, hủy booking"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BookingList;
