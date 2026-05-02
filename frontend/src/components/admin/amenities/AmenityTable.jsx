import React, { useState } from "react";
import { Edit2, MoreVertical, Trash2, Eye } from "lucide-react";

export default function AmenityTable({ amenities, isLoading, onEdit, onDelete, onToggle, onView }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="rounded-tl-[28px] border-b border-slate-100 px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Icon</th>
            <th className="border-b border-slate-100 px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Tên tiện nghi</th>
            <th className="border-b border-slate-100 px-6 py-4 text-[13px] font-black uppercase tracking-wider text-slate-500">Trạng thái</th>
            <th className="rounded-tr-[28px] border-b border-slate-100 px-6 py-4 text-right text-[13px] font-black uppercase tracking-wider text-slate-500">Hành động</th>
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

                      if (url.includes("fontawesome.com/icons/")) {
                        const iconName = url.split("/").pop().split("?")[0];
                        return <i className={`fa-solid fa-${iconName} text-lg`} />;
                      }

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
                  <div className="relative flex justify-end gap-2">
                    <button
                      onClick={() => onView(item)}
                      className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition-all hover:bg-sky-100"
                    >
                      <div className="flex items-center gap-1">
                        <Eye className="size-3.5" />
                        <span>Xem</span>
                      </div>
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-2 py-2 text-slate-700 transition-all hover:bg-slate-200"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {openMenuId === item.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[140px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onEdit(item);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
                            >
                              <Edit2 className="size-4 text-slate-400" />
                              Sửa
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onDelete(item);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-600 transition-all hover:bg-rose-50"
                            >
                              <Trash2 className="size-4 text-rose-400" />
                              Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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
