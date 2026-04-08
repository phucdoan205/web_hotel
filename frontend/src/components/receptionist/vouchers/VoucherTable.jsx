import React from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const VoucherTable = ({ data = [], onEdit, onToggle }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left table-fixed">
          <thead className="bg-gray-50/50 border-b border-gray-50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-5 w-[18%]">Mã</th>
              <th className="px-6 py-5 w-[16%]">Ưu đãi</th>
              <th className="px-6 py-5 w-[20%]">Thời gian</th>
              <th className="px-6 py-5 text-center w-[12%]">Số lần</th>
              <th className="px-6 py-5 w-[12%]">Loại</th>
              <th className="px-6 py-5 w-[14%]">Trạng thái</th>
              <th className="px-8 py-5 text-right w-[8%]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((voucher, index) => (
              <tr key={voucher.id ?? index} className="hover:bg-blue-50/10 transition-colors group align-middle">
                <td className="px-8 py-5">
                  <p className="font-bold text-gray-900 text-sm">{voucher.code}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Mã nội bộ: {voucher.id}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-bold text-gray-700">
                    {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue}`}
                  </div>
                  <div className="text-xs text-gray-400">Tối thiểu: {voucher.minBookingValue ?? "-"}</div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-bold text-gray-700">
                    {voucher.validFrom ? new Date(voucher.validFrom).toLocaleDateString() : "-"} - {voucher.validTo ? new Date(voucher.validTo).toLocaleDateString() : "-"}
                  </p>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-block px-3 py-1 bg-gray-50 rounded-full text-xs font-black text-gray-700">
                    {voucher.usageCount ?? 0}/{voucher.usageLimit ?? "-"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                      voucher.isPrivate ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {voucher.isPrivate ? "Riêng" : "Công khai"}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => typeof onToggle === "function" && onToggle(voucher)}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                        voucher.isActive ? "bg-blue-500" : "bg-rose-400"
                      }`}
                      title={voucher.isActive ? "Set deactive" : "Set active"}
                    >
                      <span
                        className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all ${
                          voucher.isActive ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`min-w-[72px] text-xs font-bold ${
                        voucher.isDeleted ? "text-gray-500" : voucher.isActive ? "text-blue-600" : "text-rose-500"
                      }`}
                    >
                      {voucher.isDeleted ? "Deleted" : voucher.isActive ? "Active" : "Deactive"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onEdit && onEdit(voucher)} className="p-2 text-blue-500 hover:bg-white rounded-xl transition-all" title="Xem voucher">
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-gray-50/50 flex justify-end items-center gap-2 border-t border-gray-50">
        <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
          <ChevronLeft size={16} />
        </button>
        <button className="size-8 bg-[#0085FF] text-white rounded-lg text-xs font-black shadow-md shadow-blue-100">1</button>
        <button className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default VoucherTable;
