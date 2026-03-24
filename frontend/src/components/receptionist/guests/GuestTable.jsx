import React from "react";
import {
  MoreVertical,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const GuestTable = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "VIP":
        return "bg-orange-50 text-orange-500 border-orange-100";
      case "REGULAR":
        return "bg-blue-50 text-blue-500 border-blue-100";
      case "BLACKLISTED":
        return "bg-rose-50 text-rose-500 border-rose-100";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
            <th className="px-8 py-5">Guest Name</th>
            <th className="px-6 py-5">Contact Info</th>
            <th className="px-6 py-5 text-center">Bookings</th>
            <th className="px-6 py-5">Last Stay</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-8 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((guest, i) => (
            <tr key={i} className="hover:bg-blue-50/10 transition-colors group">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center font-bold text-[#0085FF] text-xs overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${guest.name}&background=random`}
                      alt=""
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {guest.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      ID:{guest.id}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Mail size={12} /> {guest.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Phone size={12} /> {guest.phone}
                  </p>
                </div>
              </td>
              <td className="px-6 py-5 text-center">
                <span className="inline-block px-3 py-1 bg-gray-50 rounded-full text-xs font-black text-gray-700">
                  {guest.bookings}
                </span>
              </td>
              <td className="px-6 py-5">
                <p className="text-xs font-bold text-gray-700">
                  {guest.lastStay}
                </p>
                <p className="text-[10px] font-medium text-gray-400 italic">
                  {guest.detail}
                </p>
              </td>
              <td className="px-6 py-5">
                <span
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(guest.status)}`}
                >
                  • {guest.status}
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="p-2 text-gray-400 hover:text-[#0085FF] hover:bg-white rounded-xl transition-all">
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="px-8 py-4 bg-gray-50/50 flex justify-end items-center gap-2 border-t border-gray-50">
        <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
          <ChevronLeft size={16} />
        </button>
        <button className="size-8 bg-[#0085FF] text-white rounded-lg text-xs font-black shadow-md shadow-blue-100">
          1
        </button>
        <button className="size-8 text-gray-400 hover:bg-white rounded-lg text-xs font-bold">
          2
        </button>
        <button className="size-8 text-gray-400 hover:bg-white rounded-lg text-xs font-bold">
          3
        </button>
        <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default GuestTable;
