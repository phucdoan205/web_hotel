import React from "react";

const MonthlySummary = () => {
  const summaryData = [
    {
      month: "October 2023",
      revenue: "$128,450",
      occupancy: "84.2%",
      adr: "$142.00",
      status: "ON TRACK",
    },
    {
      month: "September 2023",
      revenue: "$114,178",
      occupancy: "79.5%",
      adr: "$138.50",
      status: "ON TRACK",
    },
    {
      month: "August 2023",
      revenue: "$142,300",
      occupancy: "92.1%",
      adr: "$155.00",
      status: "TARGET MISSED",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 text-lg">
          Monthly Performance Summary
        </h3>
        <button className="text-[11px] font-black text-blue-600 hover:underline uppercase tracking-wider">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="pb-4">Month</th>
              <th className="pb-4">Revenue</th>
              <th className="pb-4">Avg. Occupancy</th>
              <th className="pb-4">ADR</th>
              <th className="pb-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaryData.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="py-5 text-xs font-bold text-gray-900">
                  {item.month}
                </td>
                <td className="py-5 text-xs font-semibold text-gray-600">
                  {item.revenue}
                </td>
                <td className="py-5 text-xs font-semibold text-gray-600">
                  {item.occupancy}
                </td>
                <td className="py-5 text-xs font-semibold text-gray-600">
                  {item.adr}
                </td>
                <td className="py-5 text-right">
                  <span
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter
                    ${item.status === "ON TRACK" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                  >
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

export default MonthlySummary;
