// src/components/receptionist/bookings/BookingTable.jsx
import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import { Eye, Trash2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import BookingDetailModal from "./BookingDetailModal";

const BookingTable = ({ filters, onPageChange, onCheckIn }) => {
  const queryClient = useQueryClient();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const res = await bookingsApi.getBookings({
        search: filters.search,
        status: filters.status,
        roomTypeId: filters.roomTypeId,
        checkInFrom: filters.checkInFrom,
        checkInTo: filters.checkInTo,
        page: filters.page,
        pageSize: filters.pageSize,
      });
      return res;
    },
    keepPreviousData: true,
  });

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Bạn chắc chắn muốn hủy booking #${bookingId}?`))
      return;

    try {
      await bookingsApi.cancelBooking(bookingId);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      alert("Booking đã được hủy thành công.");
    } catch (err) {
      alert("Hủy booking thất bại: " + (err.response?.data?.message || err.message));
    }
  };
  const bookings = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize || 10));

  // Kiểm tra ngày check-in có phải là hôm nay không
  const isToday = (dateString) => {
    if (!dateString) return false;
    const checkInDate = new Date(dateString.split("T")[0]);
    const today = new Date();
    return (
      checkInDate.getFullYear() === today.getFullYear() &&
      checkInDate.getMonth() === today.getMonth() &&
      checkInDate.getDate() === today.getDate()
    );
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "checkedin": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-purple-100 text-purple-700";
      case "cancelled": return "bg-rose-100 text-rose-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const checkInMutation = useMutation({
    mutationFn: (bookingId) => bookingsApi.checkIn(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.setQueryData(["arrivals"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          items: oldData.items.filter((b) => b.id !== bookingId),
        };
      });

      // 🔥 cập nhật tab lưu trú
      queryClient.invalidateQueries({ queryKey: ["in-house"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      alert("Check-in successful");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || // backend trả về
        error?.response?.data ||         // trường hợp trả string
        error.message ||                // lỗi JS
        "Check-in failed";

      alert(message);
    }
  });

  const handleCheckIn = async (bookingId) => {
    await checkInMutation.mutateAsync(bookingId);
  };

  if (error) return <div className="text-red-500 p-8 text-center">Lỗi tải dữ liệu booking</div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-sm font-black text-gray-500 uppercase tracking-widest">
              <th className="px-4 py-2 text-left">Booking ID</th>
              <th className="px-4 py-2 text-left">Khách hàng</th>
              <th className="px-4 py-2 text-left">Ngày check In</th>
              <th className="px-4 py-2 text-left">Loại phòng</th>
              <th className="px-4 py-2 text-center">Trạng thái</th>
              <th className="px-4 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-500">Đang tải...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-500">Chưa có booking nào</td></tr>
            ) : (
              bookings.map((booking) => {
                const checkInDate = booking.bookingDetails?.[0]?.checkInDate;
                const canCheckIn = booking.status === "Confirmed" && isToday(checkInDate);

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-bold text-sm text-blue-600">{booking.bookingCode}</td>
                    <td className="px-4 py-2 font-semibold text-sm">
                      {booking.guestName || booking.guest?.name || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {checkInDate ? checkInDate.split("T")[0] : "—"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {booking.bookingDetails?.[0]?.roomTypeName || "—"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        {/* Nút xem chi tiết */}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailOpen(true);
                          }}
                          className="p-2 hover:bg-sky-100 rounded-xl text-sky-600 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Nút Nhận phòng - Chỉ hiển thị khi là ngày hôm nay và trạng thái Confirmed */}
                        {canCheckIn && (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm"
                            title="Nhận phòng ngay"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {/* Nút Hủy Booking */}
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 hover:bg-red-100 rounded-xl text-red-600 transition-all"
                          title="Hủy booking"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-8 py-5 border-t flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Hiển thị {bookings.length} / {totalCount} booking
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium px-3">
            Trang {filters.page} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
            className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <BookingDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingTable;