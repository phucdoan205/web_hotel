import React from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function AmenityTable({ amenities, isLoading, onEdit, onDelete, onToggle }) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Icon</th>
            <th className="px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Tên tiện nghi</th>
            <th className="px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Trạng thái</th>
            <th className="px-6 py-4 text-right text-[13px] font-black uppercase tracking-wider text-slate-500">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {amenities.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                Không tìm thấy tiện nghi nào.
              </td>
            </tr>
          ) : (
            amenities.map((item) => (
              <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                    {(() => {
                      const url = item.iconUrl || "";
                      if (!url) return <span className="text-[10px]">No Icon</span>;

                      // Nếu là link từ trang web fontawesome, trích xuất tên icon
                      if (url.includes("fontawesome.com/icons/")) {
                        const iconName = url.split("/").pop().split("?")[0];
                        return <i className={`fa-solid fa-${iconName} text-lg`} />;
                      }

                      // Nếu là link ảnh trực tiếp
                      if (url.startsWith("http")) {
                        return (
                          <img
                            src={url}
                            alt=""
                            className="size-6 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://ui-avatars.com/api/?name=?&background=f1f5f9&color=94a3b8";
                            }}
                          />
                        );
                      }

                      // Nếu là class fontawesome hoặc tên icon
                      return (
                        <i className={`${url.includes("fa-") ? url : `fa-solid fa-${url}`} text-lg`} />
                      );
                    })()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.name}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggle(item)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.isActive ? "bg-orange-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
