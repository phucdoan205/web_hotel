import React from "react";

const RecentHistory = () => {
  const history = [
    {
      hotel: "Vinpearl Resort",
      date: "Aug 12 - 14, 2023",
      price: 210,
      status: "Completed",
    },
    {
      hotel: "Sofitel Plaza",
      date: "Jul 05 - 08, 2023",
      price: 155,
      status: "Completed",
    },
    {
      hotel: "Mường Thanh Hotel",
      date: "Jun 20 - 21, 2023",
      price: 85,
      status: "Completed",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="text-[#0085FF]">🕒</span> Recent History
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="pb-4 text-[9px] font-black text-gray-400 uppercase">
                Hotel
              </th>
              <th className="pb-4 text-[9px] font-black text-gray-400 uppercase">
                Stay Date
              </th>
              <th className="pb-4 text-[9px] font-black text-gray-400 uppercase text-center">
                Price
              </th>
              <th className="pb-4 text-[9px] font-black text-gray-400 uppercase text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((item, idx) => (
              <tr
                key={idx}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-4 text-[11px] font-black text-gray-900">
                  {item.hotel}
                </td>
                <td className="py-4 text-[10px] font-bold text-gray-400">
                  {item.date}
                </td>
                <td className="py-4 text-[11px] font-black text-gray-900 text-center">
                  ${item.price}
                </td>
                <td className="py-4 text-right">
                  <span className="bg-emerald-50 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentHistory;
