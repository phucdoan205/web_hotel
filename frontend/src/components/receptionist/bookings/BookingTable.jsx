import React from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const BookingTable = () => {
  const bookings = [
    {
      id: "#BK-8821",
      guest: "John Smith",
      dates: "Oct 12 - Oct 15, 2023",
      room: "302",
      amount: "$450.00",
      status: "Confirmed",
    },
    {
      id: "#BK-8822",
      guest: "Sarah Wilson",
      dates: "Oct 14 - Oct 16, 2023",
      room: "105",
      amount: "$320.00",
      status: "Pending",
    },
    {
      id: "#BK-8823",
      guest: "Robert Brown",
      dates: "Oct 10 - Oct 12, 2023",
      room: "204",
      amount: "$280.00",
      status: "Completed",
    },
    {
      id: "#BK-8824",
      guest: "Emily Davis",
      dates: "Oct 20 - Oct 22, 2023",
      room: "401",
      amount: "$500.00",
      status: "Cancelled",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-600";
      case "Pending":
        return "bg-amber-50 text-amber-600";
      case "Completed":
        return "bg-blue-50 text-blue-600";
      case "Cancelled":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-5">Booking ID</th>
              <th className="px-6 py-5">Guest Name</th>
              <th className="px-6 py-5">Stay Dates</th>
              <th className="px-6 py-5">Room</th>
              <th className="px-6 py-5 text-center">Total Amount</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((booking, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-8 py-5 text-xs font-bold text-blue-500">
                  {booking.id}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                      {booking.guest
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {booking.guest}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs font-medium text-gray-500">
                  {booking.dates}
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-700">
                    {booking.room}
                  </span>
                </td>
                <td className="px-6 py-5 text-xs font-black text-gray-900 text-center">
                  {booking.amount}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${getStatusStyle(booking.status)}`}
                  >
                    • {booking.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Booking"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing 1 to 5 of 24 results
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ChevronLeft size={16} />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`size-8 rounded-xl text-xs font-black transition-all ${page === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
