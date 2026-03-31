import React from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const AuditTable = () => {
  const logs = [
    {
      id: 1,
      timestamp: "Oct 24, 2023 14:23:12",
      user: "John Doe",
      role: "Admin",
      action: "Changed Room Price",
      details: "Room 402: $120 -> $145",
      ip: "192.168.1.45",
      status: "Success",
    },
    {
      id: 2,
      timestamp: "Oct 24, 2023 11:05:44",
      user: "Sarah Miller",
      role: "Manager",
      action: "Added Staff",
      details: "Profile: David Chen (Receptionist)",
      ip: "192.168.1.12",
      status: "Success",
    },
    {
      id: 3,
      timestamp: "Oct 23, 2023 23:59:01",
      user: "System",
      role: "Automated Task",
      action: "Daily Backup",
      details: "Cloud synchronization complete",
      ip: "::1",
      status: "Success",
    },
    {
      id: 4,
      timestamp: "Oct 23, 2023 18:47:30",
      user: "John Doe",
      role: "Admin",
      action: "Failed Login Attempt",
      details: "Invalid password for admin user",
      ip: "102.34.12.80",
      status: "Failed",
    },
    {
      id: 5,
      timestamp: "Oct 23, 2023 15:12:00",
      user: "Beth Taylor",
      role: "Receptionist",
      action: "Modified Booking",
      details: "Ref: #BK-8821 Check-out date adjusted",
      ip: "192.168.1.184",
      status: "Success",
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mt-6">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <th className="px-8 py-5">Timestamp</th>
            <th className="px-6 py-5">User</th>
            <th className="px-6 py-5">Action</th>
            <th className="px-6 py-5">IP Address</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">
                    {log.timestamp.split(" ")[0] +
                      " " +
                      log.timestamp.split(" ")[1] +
                      " " +
                      log.timestamp.split(" ")[2]}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    {log.timestamp.split(" ")[3]}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                    {log.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      {log.user}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {log.role}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold ${log.status === "Failed" ? "text-rose-500" : "text-orange-600"}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 italic">
                    {log.details}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-xs font-medium text-gray-500 font-mono">
                {log.ip}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`size-1.5 rounded-full ${log.status === "Success" ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-tight ${log.status === "Success" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {log.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <ExternalLink className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="px-8 py-5 flex items-center justify-between border-t border-gray-50 bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-900">1 to 5</span> of 1,240 entries
        </p>
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-gray-300 hover:text-gray-600">
            <ChevronLeft className="size-4" />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`size-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
              ${p === 1 ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "text-gray-400 hover:bg-gray-100"}`}
            >
              {p}
            </button>
          ))}
          <button className="p-2 text-gray-300 hover:text-gray-600">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;
