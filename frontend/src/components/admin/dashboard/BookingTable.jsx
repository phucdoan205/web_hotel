import React from "react";
import { MoreHorizontal } from "lucide-react";

const BookingTable = () => {
  const bookings = [
    {
      id: "#BK-9021",
      guest: "John Doe",
      room: "Deluxe Suite - 402",
      price: "$1,200",
      status: "CONFIRMED",
    },
    {
      id: "#BK-9022",
      guest: "Alice Smith",
      room: "Standard - 105",
      price: "$450",
      status: "PENDING",
    },
    {
      id: "#BK-9023",
      guest: "Bruce Wayne",
      room: "Penthouse - 801",
      price: "$3,500",
      status: "CANCELLED",
    },
  ];

  const statusStyles = {
    CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    PENDING: "bg-orange-50 text-orange-600 border-orange-100",
    CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 text-lg">Recent Bookings</h3>
        <button className="text-sky-600 text-sm font-semibold hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-50">
              <th className="pb-4">Booking ID</th>
              <th className="pb-4">Guest Name</th>
              <th className="pb-4">Room</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 font-semibold text-gray-900">{b.id}</td>
                <td className="py-4 text-gray-600">{b.guest}</td>
                <td className="py-4 text-gray-600">{b.room}</td>
                <td className="py-4 font-bold text-gray-900">{b.price}</td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${statusStyles[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreHorizontal className="size-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
