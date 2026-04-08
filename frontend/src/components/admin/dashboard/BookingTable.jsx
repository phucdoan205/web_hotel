const statusStyles = {
  Confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Pending: "bg-orange-50 text-orange-600 border-orange-100",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  CheckedIn: "bg-sky-50 text-sky-600 border-sky-100",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
};

const BookingTable = ({ bookings = [] }) => {
  return (
    <div className="mt-6 rounded-2xl border border-gray-50 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Booking mới nhất</h3>
          <p className="text-sm font-medium text-gray-400">
            Danh sách booking mới được lấy trực tiếp từ hệ thống
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="pb-4">Mã booking</th>
              <th className="pb-4">Khách hàng</th>
              <th className="pb-4">Phòng</th>
              <th className="pb-4">Tổng tiền</th>
              <th className="pb-4">Trạng thái</th>
              <th className="pb-4">Ngày tạo</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-sm">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm font-medium text-gray-400">
                  Chưa có booking nào để hiển thị.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="py-4 font-semibold text-gray-900">{booking.bookingCode}</td>
                  <td className="py-4 text-gray-600">{booking.guestName || "Khách vãng lai"}</td>
                  <td className="py-4 text-gray-600">{booking.roomLabel}</td>
                  <td className="py-4 font-bold text-gray-900">{booking.totalLabel}</td>
                  <td className="py-4">
                    <span
                      className={`rounded-lg border px-3 py-1 text-[10px] font-bold ${
                        statusStyles[booking.status] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {booking.status || "Chưa rõ"}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">{booking.createdLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
