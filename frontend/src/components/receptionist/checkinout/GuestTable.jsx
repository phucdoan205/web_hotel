import React from "react";
import { Search, SlidersHorizontal, MoreVertical } from "lucide-react";

const GuestTable = ({ activeTab, data }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      {/* Table Header với thanh Search */}
      <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "in" ? "check-in" : "check-out"}...`}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs w-80 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-5">Guest Name</th>
              <th className="px-6 py-5">Booking ID</th>
              <th className="px-6 py-5">Room Type</th>
              <th className="px-6 py-5">
                {activeTab === "in" ? "Arrival Date" : "Departure Date"}
              </th>
              <th className="px-6 py-5 text-center">Payment</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((guest, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {guest.name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {guest.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs font-bold text-gray-400">
                  {guest.id}
                </td>
                <td className="px-6 py-5 text-xs font-medium text-gray-600">
                  {guest.room}
                </td>
                <td className="px-6 py-5 text-xs font-medium text-gray-500">
                  {guest.date}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                      guest.payment === "Paid"
                        ? "bg-emerald-50 text-emerald-500"
                        : guest.payment === "Partial"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {guest.payment}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className={`${activeTab === "in" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"} text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg`}
                    >
                      {activeTab === "in" ? "Check-in" : "Check-out"}
                    </button>
                    <button className="p-2 text-gray-300 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestTable;
