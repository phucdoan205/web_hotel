// src/components/receptionist/bookings/BookingTable.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../../../api/admin/bookingsApi";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const BookingTable = ({ filters, onPageChange }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingsApi.getBookings({
      search: filters.search,
      status: filters.status,
      roomTypeId: filters.roomTypeId,
      checkInFrom: filters.checkInFrom,
      checkInTo: filters.checkInTo,
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    keepPreviousData: true,
  });

  const bookings = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / (filters.pageSize || 10));

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

  console.log("Loaded bookings:", bookings);

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
              <th className="px-4 py-2 text-left">Ngày check Out</th>
              <th className="px-4 py-2 text-left">Loại phòng</th>
              <th className="px-4 py-2 text-center">Số tiền</th>
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
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-bold text-sm text-blue-600">{booking.bookingCode}</td>
                  <td className="px-4 py-2 font-semibold text-sm">{booking.guestName || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {booking.bookingDetails?.[0]?.checkInDate?.split("T")[0]}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {booking.bookingDetails?.[0]?.checkOutDate?.split("T")[0]}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {booking.bookingDetails?.[0]?.roomTypeName || "—"}
                  </td>
                  <td className="px-4 py-2 text-center font-bold text-gray-900">
                    {(booking.totalAmount || 0).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-3">
                      <button className="p-2 hover:bg-blue-100 rounded-xl text-blue-600 transition-all">
                        <Pencil size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-xl text-red-600 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
          <button onClick={() => onPageChange(filters.page - 1)} disabled={filters.page <= 1}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium">Trang {filters.page} / {totalPages || 1}</span>
          <button onClick={() => onPageChange(filters.page + 1)} disabled={filters.page >= totalPages}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
    // // Lấy danh sách loại phòng + phòng khả dụng
    // const { data: roomTypes = [], isLoading } = useQuery({
    //     queryKey: ["roomTypes"],
    //     queryFn: async () => {
    //         const res = await roomTypesApi.getRoomTypes({ pageSize: 100 });
    //         // console.log("Loaded room types:", res.items);
    //         return res.items;
    //     },
    //     enable: open,
    //     staleTime: 5 * 60 * 1000,
    //     refetchOnWindowFocus: false
    // });