import React from "react";
import { X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AmenityViewModal({ open, amenity, onClose }) {
  if (!amenity) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Chi tiết tiện nghi</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-white shadow-sm text-orange-600">
                  {(() => {
                    const url = amenity.iconUrl || "";
                    if (url.includes("fontawesome.com/icons/")) {
                      const iconName = url.split("/").pop().split("?")[0];
                      return <i className={`fa-solid fa-${iconName} text-2xl`} />;
                    }
                    if (url.startsWith("http")) {
                      return <img src={url} alt="" className="size-8 object-contain" />;
                    }
                    return <i className={`${url.includes("fa-") ? url : `fa-solid fa-${url}`} text-2xl`} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{amenity.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-wider ${amenity.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {amenity.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Danh sách tính năng</h4>
                <div className="space-y-3">
                  {amenity.details?.length > 0 ? (
                    amenity.details.map((detail) => (
                      <div key={detail.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <p className="text-sm font-semibold text-slate-700">{detail.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm font-medium text-slate-400">Không có chi tiết bổ sung.</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
