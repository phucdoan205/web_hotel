import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { getAvatarPreview } from "../../../utils/avatar";

const roleStyles = {
  1: "bg-amber-50 text-amber-700",
  4: "bg-emerald-50 text-emerald-700",
  5: "bg-blue-50 text-blue-600",
};

const roleLabels = {
  1: "Admin",
  4: "HouseKeeping",
  5: "Receptionist",
};

const StaffTable = ({ staff, isLoading, error, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5">ID</th>
              <th className="px-6 py-5">Avatar</th>
              <th className="px-6 py-5">Name</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm font-semibold text-gray-400"
                >
                  Loading staff list...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm font-semibold text-rose-500"
                >
                  {error}
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm font-semibold text-gray-400"
                >
                  No staff found.
                </td>
              </tr>
            ) : (
              staff.map((member) => {
                const isActive = member.status === true;
                const roleLabel = roleLabels[member.roleId] ?? member.roleName ?? "No Role";

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                      #{member.id}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={getAvatarPreview(member, "Staff")}
                        alt={member.fullName}
                        className="size-11 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {member.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          roleStyles[member.roleId] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`size-2 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-rose-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-bold ${
                            isActive ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {isActive ? "Active" : "Deleted"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(member)}
                          className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                          title="Edit staff"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(member)}
                          disabled={!isActive}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Soft delete staff"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-5 border-t border-gray-50 bg-white">
        <p className="text-xs font-bold text-gray-400">
          Showing <span className="text-gray-900">{staff.length}</span> staff
        </p>
      </div>
    </div>
  );
};

export default StaffTable;
