import React, { useState } from "react";
import { UserPlus, Search, Edit2, MoreVertical, Mail } from "lucide-react";

const TeamManagementTab = () => {
  const [filter, setFilter] = useState("All Staff");

  const staffMembers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@traveloka.com",
      role: "Admin",
      status: "Active",
      lastActive: "Just now",
      initial: "JD",
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.s@traveloka.com",
      role: "Receptionist",
      status: "Active",
      lastActive: "2 mins ago",
      initial: "JS",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@traveloka.com",
      role: "Housekeeping",
      status: "Offline",
      lastActive: "5 hours ago",
      initial: "MJ",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.w@traveloka.com",
      role: "Receptionist",
      status: "Active",
      lastActive: "10 mins ago",
      initial: "SW",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff members..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-100 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff5e1f] hover:bg-[#e5501a] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-100">
          <UserPlus className="size-4" />
          Add New Member
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100">
        {["All Staff", "Active", "Offline"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all relative
              ${filter === item ? "text-[#ff5e1f]" : "text-gray-400 hover:text-gray-600"}`}
          >
            {item}
            {filter === item && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff5e1f]" />
            )}
          </button>
        ))}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Name
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Role
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Last Active
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staffMembers.map((staff) => (
              <tr
                key={staff.id}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-2xl ${staff.color} flex items-center justify-center font-black text-xs shadow-sm`}
                    >
                      {staff.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">
                        {staff.name}
                      </h4>
                      <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                        <Mail className="size-3" /> {staff.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-tight">
                    {staff.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${staff.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-[11px] font-black uppercase ${staff.status === "Active" ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      {staff.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[11px] font-bold text-gray-400">
                  {staff.lastActive}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#ff5e1f] hover:bg-orange-50 rounded-xl transition-all">
                      <Edit2 className="size-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
          <p className="text-[11px] font-bold text-gray-400">
            Showing 1 to 4 of 24 staff members
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50">
              Previous
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`size-9 rounded-xl text-[10px] font-black transition-all
                  ${page === 1 ? "bg-[#ff5e1f] text-white shadow-lg shadow-orange-100" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementTab;
