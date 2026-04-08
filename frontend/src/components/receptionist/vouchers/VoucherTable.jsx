import React from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

const VoucherTable = ({ data = [], onEdit, onDelete, onSend, onToggle }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <table className="w-full text-left table-fixed">
        <thead className="bg-gray-50/50 border-b border-gray-50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
            <th className="px-8 py-5">Mã</th>
            <th className="px-6 py-5">Ưu đãi</th>
            <th className="px-6 py-5">Thời gian</th>
            <th className="px-6 py-5 text-center">Số lần</th>
            <th className="px-6 py-5">Loại</th>
            <th className="px-6 py-5">Trạng thái</th>
            <th className="px-8 py-5 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((v, i) => (
            <tr key={v.id ?? i} className="hover:bg-blue-50/10 transition-colors group">
              <td className="px-8 py-5">
                <p className="font-bold text-gray-900 text-sm">{v.code}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1">Mã nội bộ: {v.id}</p>
              </td>
              <td className="px-6 py-5">
                <div className="text-sm font-bold text-gray-700">
                  {v.discountType === "PERCENT" ? `${v.discountValue}%` : `${v.discountValue}`}
                </div>
                <div className="text-xs text-gray-400">Tối thiểu: {v.minBookingValue ?? "-"}</div>
              </td>
              <td className="px-6 py-5">
                <p className="text-xs font-bold text-gray-700">{v.validFrom ? new Date(v.validFrom).toLocaleDateString() : "-"} - {v.validTo ? new Date(v.validTo).toLocaleDateString() : "-"}</p>
              </td>
              <td className="px-6 py-5 text-center">
                <span className="inline-block px-3 py-1 bg-gray-50 rounded-full text-xs font-black text-gray-700">
                  {v.usageCount ?? 0}/{v.usageLimit ?? "-"}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => typeof onToggle === 'function' && onToggle(v)}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${v.isActive ? 'bg-blue-500' : 'bg-rose-400'}`}
                    title={v.isActive ? 'Set deactive' : 'Set active'}
                  >
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm ${v.isActive ? 'left-6' : 'left-1'}`} />
                  </button>
                  <span className={`min-w-[52px] text-xs font-bold ${v.isActive ? 'text-blue-600' : 'text-rose-500'}`}>
                    {v.isDeleted ? 'Deleted' : (v.isActive ? 'Active' : 'Deactive')}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                <button onClick={() => onEdit && onEdit(v)} className="p-2 text-blue-500 hover:bg-white rounded-xl transition-all" title="View">
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
