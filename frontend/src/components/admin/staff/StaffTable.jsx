import React from "react";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const StaffTable = () => {
  const staffData = [
    {
      id: "ID-2941",
      name: "Andi Wijaya",
      role: "Receptionist",
      email: "andi.w@hotel.com",
      phone: "+62 812 3456 789",
      status: "Active",
      photo: "https://i.pravatar.cc/150?u=2941",
    },
    {
      id: "ID-2942",
      name: "Siti Aminah",
      role: "Housekeeping",
      email: "siti.a@hotel.com",
      phone: "+62 812 9876 543",
      status: "On Leave",
      photo: "https://i.pravatar.cc/150?u=2942",
    },
    {
      id: "ID-2943",
      name: "Budi Santoso",
      role: "Manager",
      email: "budi.s@hotel.com",
      phone: "+62 813 1122 334",
      status: "Active",
      photo: "https://i.pravatar.cc/150?u=2943",
    },
    {
      id: "ID-2944",
      name: "Dewi Lestari",
      role: "Receptionist",
      email: "dewi.l@hotel.com",
      phone: "+62 811 5566 778",
      status: "Active",
      photo: "https://i.pravatar.cc/150?u=2944",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <th className="px-6 py-5">Staff ID</th>
            <th className="px-6 py-5">Photo</th>
            <th className="px-6 py-5">Name</th>
            <th className="px-6 py-5">Role</th>
            <th className="px-6 py-5">Contact</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {staffData.map((staff) => (
            <tr
              key={staff.id}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-400">
                {staff.id}
              </td>
              <td className="px-6 py-4">
                <img
                  src={staff.photo}
                  alt={staff.name}
                  className="size-10 rounded-full object-cover ring-2 ring-gray-100"
                />
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                {staff.name}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight
                  ${
                    staff.role === "Receptionist"
                      ? "bg-blue-50 text-blue-500"
                      : staff.role === "Housekeeping"
                        ? "bg-purple-50 text-purple-500"
                        : "bg-indigo-50 text-indigo-500"
                  }`}
                >
                  {staff.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-600">
                    {staff.email}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {staff.phone}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-1.5 rounded-full ${staff.status === "Active" ? "bg-emerald-500" : "bg-orange-400"}`}
                  />
                  <span
                    className={`text-xs font-bold ${staff.status === "Active" ? "text-emerald-600" : "text-orange-500"}`}
                  >
                    {staff.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">
                    <Edit2 className="size-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination (Dựa trên ảnh) */}
      <div className="px-8 py-5 flex items-center justify-between border-t border-gray-50 bg-white">
        <p className="text-xs font-bold text-gray-300">
          Showing <span className="text-gray-900">1 to 4</span> of 24 staff
        </p>
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-gray-300 hover:text-gray-600">
            <ChevronLeft className="size-4" />
          </button>
          {[1, 2, 3, "...", 6].map((p, i) => (
            <button
              key={i}
              className={`size-8 flex items-center justify-center rounded-xl text-xs font-black transition-all
              ${p === 1 ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-gray-400 hover:bg-gray-100"}`}
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

export default StaffTable;
