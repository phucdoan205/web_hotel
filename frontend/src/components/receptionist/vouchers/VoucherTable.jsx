import React from "react";
import { Eye, Pencil, Send, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const VoucherTable = ({
  data = [],
  onView,
  onEdit,
  onDelete,
  onToggle,
  onSend,
  canView = true,
  canEdit = false,
  canDelete = false,
  canSend = false,
  canEnable = false,
  canDisable = false,
}) => {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-gray-50 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full table-fixed text-left">
          <thead className="border-b border-gray-50 bg-gray-50/50">
            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
              <th className="w-[16%] px-8 py-5">Mã</th>
              <th className="w-[16%] px-6 py-5">Ưu đãi</th>
              <th className="w-[18%] px-6 py-5">Thời gian</th>
              <th className="w-[12%] px-6 py-5 text-center">Số lần</th>
              <th className="w-[12%] px-6 py-5">Loại</th>
              <th className="w-[14%] px-6 py-5">Trạng thái</th>
              <th className="w-[12%] px-8 py-5 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((voucher, index) => {
              const canToggle =
                (voucher.isActive && canDisable) || (!voucher.isActive && canEnable);

              return (
                <tr
                  key={voucher.id ?? index}
                  className="group align-middle transition-colors hover:bg-blue-50/10"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-900">{voucher.code}</p>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">Mã nội bộ: {voucher.id}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-gray-700">
                      {voucher.discountType === "PERCENT"
                        ? `${voucher.discountValue}%`
                        : `${voucher.discountValue}`}
                    </div>
                    <div className="text-xs text-gray-400">Tối thiểu: {voucher.minBookingValue ?? "-"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-gray-700">
                      {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString() : "-"} -{" "}
                      {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString() : "-"}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-block rounded-full bg-gray-50 px-3 py-1 text-xs font-black text-gray-700">
                      {voucher.usageCount ?? 0}/{voucher.usageLimit ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        voucher.isPrivate
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {voucher.isPrivate ? "Riêng" : "Công khai"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {canToggle ? (
                        <button
                          type="button"
                          onClick={() => typeof onToggle === "function" && onToggle(voucher)}
                          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                            voucher.isActive ? "bg-blue-500" : "bg-rose-400"
                          }`}
                          title={voucher.isActive ? "Tắt voucher" : "Bật voucher"}
                        >
                          <span
                            className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${
                              voucher.isActive ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      ) : null}
                      <span
                        className={`min-w-[72px] text-xs font-bold ${
                          voucher.isDeleted
                            ? "text-gray-500"
                            : voucher.isActive
                              ? "text-blue-600"
                              : "text-rose-500"
                        }`}
                      >
                        {voucher.isDeleted ? "Deleted" : voucher.isActive ? "Active" : "Deactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canView ? (
                        <button
                          type="button"
                          onClick={() => onView && onView(voucher)}
                          className="rounded-xl p-2 text-blue-500 transition-all hover:bg-blue-50"
                          title="Xem voucher"
                        >
                          <Eye size={16} />
                        </button>
                      ) : null}

                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(voucher)}
                          className="rounded-xl p-2 text-sky-600 transition-all hover:bg-sky-50"
                          title="Sửa voucher"
                        >
                          <Pencil size={16} />
                        </button>
                      ) : null}

                      {canSend ? (
                        <button
                          type="button"
                          onClick={() => onSend && onSend(voucher)}
                          className="rounded-xl p-2 text-indigo-600 transition-all hover:bg-indigo-50"
                          title="Gửi voucher"
                        >
                          <Send size={16} />
                        </button>
                      ) : null}

                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete && onDelete(voucher)}
                          className="rounded-xl p-2 text-rose-600 transition-all hover:bg-rose-50"
                          title="Xóa voucher"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gray-50 bg-gray-50/50 px-8 py-4">
        <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-white">
          <ChevronLeft size={16} />
        </button>
        <button className="size-8 rounded-lg bg-[#0085FF] text-xs font-black text-white shadow-md shadow-blue-100">
          1
        </button>
        <button className="rounded-lg p-2 text-gray-400 transition-all hover:bg-white">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default VoucherTable;
