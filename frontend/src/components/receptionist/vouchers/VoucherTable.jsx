import React from "react";
import { Eye, Pencil, Send, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [openDropdownId, setOpenDropdownId] = React.useState(null);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="rounded-[2.5rem] border border-gray-50 bg-white shadow-sm overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-gray-50">
        {data.map((voucher, index) => {
          const canToggle =
            (voucher.isActive && canDisable) || (!voucher.isActive && canEnable);

          return (
            <div key={voucher.id ?? index} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-blue-600 tracking-wider uppercase">{voucher.code}</p>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                      voucher.voucherType === "Service"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : voucher.voucherType === "Birthday"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {voucher.voucherType === "Service" ? "Dịch vụ" : voucher.voucherType === "Birthday" ? "Sinh nhật" : "Đặt phòng"}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-black text-slate-900 line-clamp-2 leading-snug">
                    {voucher.name || "Chưa đặt tên"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canView && (
                    <button
                      type="button"
                      onClick={() => onView && onView(voucher)}
                      className="rounded-xl bg-blue-50 p-2 text-blue-600 active:scale-95 transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(openDropdownId === voucher.id ? null : voucher.id)}
                    className="rounded-xl bg-slate-50 p-2 text-slate-500 active:scale-95 transition-all"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ưu đãi</p>
                  <div className="text-sm font-black text-slate-900">
                    {voucher.discountType === "PERCENT"
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue?.toLocaleString()} VND`}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    Tối thiểu: {voucher.minBookingValue?.toLocaleString() ?? "0"} VND
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số lần sử dụng</p>
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-700">
                    {voucher.usageCount ?? 0} / {voucher.usageLimit ?? "∞"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hiệu lực</p>
                  <p className="text-[11px] font-bold text-slate-600">
                    {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString("vi-VN") : "N/A"} -{" "}
                    {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString("vi-VN") : "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {canToggle ? (
                    <button
                      type="button"
                      onClick={() => typeof onToggle === "function" && onToggle(voucher)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                        voucher.isActive ? "bg-blue-500" : "bg-rose-400"
                      }`}
                    >
                      <span
                        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${
                          voucher.isActive ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  ) : null}
                  <span
                    className={`text-xs font-black uppercase tracking-wide ${
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
              </div>

              {openDropdownId === voucher.id && (
                <div className="grid grid-cols-2 gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onEdit && onEdit(voucher);
                        setOpenDropdownId(null);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 py-2.5 text-xs font-black text-sky-700 active:scale-[0.98] transition-all"
                    >
                      <Pencil size={14} /> Chỉnh sửa
                    </button>
                  )}
                  {canSend && (
                    <button
                      type="button"
                      onClick={() => {
                        onSend && onSend(voucher);
                        setOpenDropdownId(null);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-xs font-black text-indigo-700 active:scale-[0.98] transition-all"
                    >
                      <Send size={14} /> Gửi voucher
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <table className="min-w-full w-full table-fixed text-left">
          <thead className="border-b border-gray-50 bg-gray-50/50">
            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
              <th className="w-[12%] px-8 py-5">Mã</th>
              <th className="w-[20%] px-6 py-5">Tên</th>
              <th className="w-[12%] px-6 py-5">Ưu đãi</th>
              <th className="w-[15%] px-6 py-5">Thời gian</th>
              <th className="w-[10%] px-6 py-5 text-center">Số lần</th>
              <th className="w-[16%] px-6 py-5">Trạng thái</th>
              <th className="w-[15%] px-10 py-5 text-right">Hành động</th>
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
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase mt-1 ${
                      voucher.voucherType === "Service"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : voucher.voucherType === "Birthday"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {voucher.voucherType === "Service" ? "Dịch vụ" : voucher.voucherType === "Birthday" ? "Sinh nhật" : "Đặt phòng"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1" title={voucher.name}>
                      {voucher.name || "Chưa đặt tên"}
                    </p>
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

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(openDropdownId === voucher.id ? null : voucher.id)}
                          className="rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-50"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openDropdownId === voucher.id ? (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-full z-[100] mt-2 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]"
                          >
                            <div className="py-1">
                              {canEdit ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onEdit && onEdit(voucher);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-sky-600 hover:bg-sky-50 transition-colors"
                                >
                                  <Pencil size={14} />
                                  Chỉnh sửa
                                </button>
                              ) : null}
                              {canSend ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSend && onSend(voucher);
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                  <Send size={14} />
                                  Gửi voucher
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
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
