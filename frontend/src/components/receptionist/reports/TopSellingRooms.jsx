import React from "react";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency, formatPercent } from "../../../utils/formatters";

const roomData = [
  {
    id: 1,
    type: "Deluxe Ocean Suite",
    bookings: 45,
    occupancy: 92,
    revenue: 12400,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=100",
  },
  {
    id: 2,
    type: "Executive Twin Room",
    bookings: 38,
    occupancy: 85,
    revenue: 9250,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=100",
  },
  {
    id: 3,
    type: "Standard King Room",
    bookings: 24,
    occupancy: 70,
    revenue: 5100,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=100",
  },
];

const TopSellingRooms = () => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
          Top Selling Room Types
        </h3>
        <button className="text-[#0085FF] text-xs font-black hover:underline">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-4">Room Type</th>
              <th className="px-8 py-4">Bookings</th>
              <th className="px-8 py-4">Occupancy</th>
              <th className="px-8 py-4">Revenue</th>
              <th className="px-8 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {roomData.map((room) => (
              <tr
                key={room.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-8 py-5 flex items-center gap-4">
                  <img
                    src={room.image}
                    className="size-12 rounded-2xl object-cover"
                    alt=""
                  />
                  <span className="text-xs font-black text-gray-700">
                    {room.type}
                  </span>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-gray-500">
                  {room.bookings}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[100px]">
                      <div
                        className="h-full bg-[#0085FF] rounded-full"
                        style={{ width: `${room.occupancy}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-[#0085FF]">
                      {formatPercent(room.occupancy)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs font-black text-gray-700">
                  {formatCurrency(room.revenue)}
                </td>
                <td className="px-8 py-5 text-center">
                  <button className="text-gray-300 group-hover:text-gray-900 transition-colors">
                    <MoreHorizontal size={20} />
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

export default TopSellingRooms;
