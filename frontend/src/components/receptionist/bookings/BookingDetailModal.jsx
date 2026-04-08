import React from "react";
import { X, Calendar, User, CreditCard, Clock } from "lucide-react";

export default function BookingDetailModal({ open, onClose, booking }) {
  if (!open || !booking) return null;

  const detail = booking.bookingDetails?.[0] || {};
  const guest = booking.guest || {};
  const nights = detail.checkOutDate && detail.checkInDate
    ? Math.ceil((new Date(detail.checkOutDate) - new Date(detail.checkInDate)) / (1000 * 3600 * 24))
    : 0;

  const totalAmount = (detail.pricePerNight || 0) * nights;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-8 py-6 bg-gray-50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Chi tiết Booking</h2>
            <p className="text-sm text-gray-500 mt-1">Mã: <span className="font-mono font-bold">{booking.bookingCode}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-200 rounded-2xl transition-all"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Thông tin khách hàng */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <User className="text-orange-600" size={28} />
              <h3 className="text-lg font-bold text-gray-800">Thông tin khách hàng</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Tên khách</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {booking.guestName || booking.guest?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {booking.guestPhone || booking.guest?.phone || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {booking.guestEmail || booking.guest?.email || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin đặt phòng */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-orange-600" size={28} />
              <h3 className="text-lg font-bold text-gray-800">Thông tin đặt phòng</h3>
            </div>

            {booking.bookingDetails && booking.bookingDetails.length > 0 ? (
              booking.bookingDetails.map((detail, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">SỐ PHÒNG</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">
                        {detail.room?.roomNumber || detail.roomNumber || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">LOẠI PHÒNG</p>
                      <p className="font-semibold text-lg mt-1">
                        {detail.roomTypeName || detail.roomType?.name || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <p className="text-gray-500 text-xs">CHECK-IN</p>
                      <p className="font-semibold mt-1">
                        {detail.checkInDate ? new Date(detail.checkInDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">CHECK-OUT</p>
                      <p className="font-semibold mt-1">
                        {detail.checkOutDate ? new Date(detail.checkOutDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t flex justify-between text-sm">
                    <span className="text-gray-600">Giá mỗi đêm</span>
                    <span className="font-semibold">
                      {(detail.pricePerNight || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có thông tin chi tiết phòng</p>
            )}
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-3">
            <Clock className="text-orange-600" size={28} />
            <div>
              <p className="text-gray-500">Trạng thái hiện tại</p>
              <span className={`inline-block px-5 py-2 rounded-2xl text-sm font-bold mt-2 ${booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                  booking.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    booking.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                }`}>
                {booking.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-2xl transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}