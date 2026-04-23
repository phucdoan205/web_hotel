import React from "react";
import { BedDouble, FileText } from "lucide-react";

const mockBookingHistory = [
  {
    id: "BK-2026-001",
    room: "Standard Single",
    dateRange: "23/04/2026 - 24/04/2026",
    guest: "1 người lớn, 0 trẻ em",
    status: "Hoàn tất",
  },
  {
    id: "BK-2026-002",
    room: "Superior City View",
    dateRange: "22/04/2026 - 24/04/2026",
    guest: "2 người lớn, 1 trẻ em",
    status: "Đang lưu trú",
  },
];

const UserBookingHistoryPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Lịch sử đặt phòng
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Lịch sử đặt phòng</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Xem lại các booking bạn đã tạo và trạng thái lưu trú gần đây.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <BedDouble size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Danh sách booking</h2>
            <p className="text-sm font-medium text-slate-500">{mockBookingHistory.length} booking gần đây</p>
          </div>
        </div>

        {mockBookingHistory.length ? (
          <div className="space-y-4">
            {mockBookingHistory.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">{booking.id}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{booking.room}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{booking.dateRange}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{booking.guest}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="mx-auto size-10" />
            <p className="mt-4 text-sm font-semibold">Bạn chưa có lịch sử đặt phòng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingHistoryPage;
