import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BookingList = () => {
  const data = [
    {
      id: "#BK-8801",
      guest: "Alex Johnson",
      room: "Deluxe Suite (201)",
      checkin: "Oct 24, 2023",
      checkout: "Oct 26, 2023",
      price: "$450.00",
      status: "Confirmed",
    },
    {
      id: "#BK-8802",
      guest: "Maria Garcia",
      room: "Standard Room (105)",
      checkin: "Oct 25, 2023",
      checkout: "Oct 27, 2023",
      price: "$210.00",
      status: "Pending",
    },
    {
      id: "#BK-8803",
      guest: "James Smith",
      room: "Executive King (402)",
      checkin: "Oct 25, 2023",
      checkout: "Oct 28, 2023",
      price: "$720.00",
      status: "Confirmed",
    },
    {
      id: "#BK-8804",
      guest: "Linda Chen",
      room: "Single Room (301)",
      checkin: "Oct 26, 2023",
      checkout: "Oct 26, 2023",
      price: "$95.00",
      status: "Cancelled",
    },
    {
      id: "#BK-8805",
      guest: "Robert Wilson",
      room: "Deluxe Suite (202)",
      checkin: "Oct 27, 2023",
      checkout: "Oct 30, 2023",
      price: "$675.00",
      status: "Confirmed",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50">
          <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th className="px-6 py-4">Booking ID</th>
            <th className="px-6 py-4">Guest Name</th>
            <th className="px-6 py-4">Room</th>
            <th className="px-6 py-4">Check-in</th>
            <th className="px-6 py-4">Check-out</th>
            <th className="px-6 py-4">Total Price</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-orange-600">
                {item.id}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-tighter">
                    {item.guest
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {item.guest}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{item.room}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {item.checkin}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {item.checkout}
              </td>
              <td className="px-6 py-4 text-sm font-black text-gray-900">
                {item.price}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm
                  ${
                    item.status === "Confirmed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : item.status === "Pending"
                        ? "bg-orange-50 text-orange-500 border-orange-100"
                        : "bg-rose-50 text-rose-500 border-rose-100"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div className="px-6 py-4 bg-white border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">
          Showing <span className="text-gray-900 font-bold">1 to 5</span> of{" "}
          <span className="text-gray-900 font-bold">12</span> bookings
        </span>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-300 hover:text-gray-600">
            <ChevronLeft className="size-4" />
          </button>
          <button className="size-8 flex items-center justify-center bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-200">
            1
          </button>
          <button className="size-8 flex items-center justify-center text-gray-600 text-xs font-bold hover:bg-gray-100 rounded-lg">
            2
          </button>
          <button className="size-8 flex items-center justify-center text-gray-600 text-xs font-bold hover:bg-gray-100 rounded-lg">
            3
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
