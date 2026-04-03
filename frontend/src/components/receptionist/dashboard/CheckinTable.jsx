import React from "react";

const CheckInTable = () => {
  const checkins = [
    {
      name: "Robert Fox",
      id: "#BK-9482",
      type: "Deluxe King",
      time: "14:30 PM",
      status: "Confirmed",
    },
    {
      name: "Jane Cooper",
      id: "#BK-1032",
      type: "Suite",
      time: "15:15 PM",
      status: "Confirmed",
    },
    {
      name: "Guy Hawkins",
      id: "#BK-8821",
      type: "Twin Room",
      time: "16:45 PM",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.15em]">
          Upcoming Check-ins
        </h3>
        <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">
          View all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Guest Name
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Booking ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Room Type
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Arrival
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {checkins.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-blue-500">
                  {row.id}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-tighter text-gray-600">
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-500">
                  {row.time}
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:shadow-blue-100">
                    Check-in
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

export default CheckInTable;
