import React from "react";
import { Edit2 } from "lucide-react";
import { getAvatarPreview } from "../../../utils/avatar";

const roleStyles = {
  1: "bg-amber-50 text-amber-700",
  4: "bg-emerald-50 text-emerald-700",
  5: "bg-blue-50 text-blue-600",
};

const activeStatusStyles = {
  track: "bg-blue-500",
  text: "text-blue-600",
};

const deletedStatusStyles = {
  track: "bg-rose-400",
  text: "text-rose-500",
};

const roleLabels = {
  1: "Quản trị viên",
  4: "Buồng phòng",
  5: "Lễ tân",
};

const StaffTable = ({
  staff,
  isLoading,
  error,
  statusUpdatingId,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-5">Mã</th>
              <th className="px-6 py-5">Ảnh đại diện</th>
              <th className="px-6 py-5">Họ tên</th>
              <th className="px-6 py-5">Vai trò</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Trạng thái</th>
              <th className="px-6 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-gray-400">
                  Đang tải danh sách nhân sự...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-rose-500">
                  {error}
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-semibold text-gray-400">
                  Không tìm thấy nhân sự nào.
                </td>
              </tr>
            ) : (
              staff.map((member) => {
                const isActive = member.status === true;
                const isUpdatingStatus = statusUpdatingId === member.id;
                const roleLabel = roleLabels[member.roleId] ?? member.roleName ?? "Chưa có vai trò";

                return (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">#{member.id}</td>
                    <td className="px-6 py-4">
                      <img
                        src={getAvatarPreview(member, "Staff")}
                        alt={member.fullName}
                        className="size-11 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{member.fullName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          roleStyles[member.roleId] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[132px] items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member)}
                          disabled={isUpdatingStatus}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            isActive ? activeStatusStyles.track : deletedStatusStyles.track
                          } ${isUpdatingStatus ? "cursor-not-allowed opacity-60" : ""}`}
                          title={isActive ? "Set deleted" : "Set active"}
                        >
                          <span
                            className={`absolute top-1 size-5 rounded-full bg-white shadow-sm ${
                              isActive ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                        <span
                          className={`min-w-[52px] text-xs font-bold ${
                            isActive ? activeStatusStyles.text : deletedStatusStyles.text
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
                          title="Chỉnh sửa nhân sự"
                        >
                          <Edit2 className="size-4" />
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
          Hiển thị <span className="text-gray-900">{staff.length}</span> nhân sự
        </p>
      </div>
    </div>
  );
};

export default StaffTable;
