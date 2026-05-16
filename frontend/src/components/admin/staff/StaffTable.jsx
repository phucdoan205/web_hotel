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
  canEdit = true,
  canDelete = true,
}) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoading ? (
          <div className="p-6 text-center text-sm font-semibold text-gray-400">
            Đang tải danh sách nhân sự...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm font-semibold text-rose-500">
            {error}
          </div>
        ) : staff.length === 0 ? (
          <div className="p-6 text-center text-sm font-semibold text-gray-400">
            Không tìm thấy nhân sự nào.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map((member) => {
              const isActive = member.status === true;
              const isUpdatingStatus = statusUpdatingId === member.id;
              const roleLabel = roleLabels[member.roleId] ?? member.roleName ?? "Chưa có vai trò";

              return (
                <div key={member.id} className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarPreview(member, "Staff")}
                        alt={member.fullName}
                        className="size-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">{member.fullName}</div>
                        <div className="text-xs font-medium text-gray-500">#{member.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(member)}
                          className="rounded-xl bg-sky-50 p-2 text-sky-600 transition-all active:scale-95"
                        >
                          <Edit2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 px-1 text-sm">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Vai trò</div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${roleStyles[member.roleId] ?? "bg-slate-100 text-slate-600"}`}>
                        {roleLabel}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</div>
                      <div className="text-xs font-medium text-gray-600 break-all">{member.email}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Trạng thái</div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member)}
                          disabled={isUpdatingStatus || !canDelete}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            isActive ? activeStatusStyles.track : deletedStatusStyles.track
                          } ${isUpdatingStatus || !canDelete ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${isActive ? "left-6" : "left-1"}`} />
                        </button>
                        <span className={`text-xs font-bold ${isActive ? activeStatusStyles.text : deletedStatusStyles.text}`}>
                          {isActive ? "Active" : "Deleted"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <table className="min-w-[760px] w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50/50">
            <tr className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
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
                  <tr key={member.id} className="transition-colors hover:bg-gray-50/50">
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
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
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
                          disabled={isUpdatingStatus || !canDelete}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            isActive ? activeStatusStyles.track : deletedStatusStyles.track
                          } ${isUpdatingStatus || !canDelete ? "cursor-not-allowed opacity-60" : ""}`}
                          title={isActive ? "Set deleted" : "Set active"}
                        >
                          <span
                            className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(member)}
                            className="rounded-xl p-2 text-gray-400 transition-all hover:bg-sky-50 hover:text-sky-600"
                            title="Chỉnh sửa nhân sự"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
