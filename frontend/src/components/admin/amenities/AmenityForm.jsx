import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AmenityForm({ open, initialData, onClose, onSave }) {
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [details, setDetails] = useState([]);
  const [newDetail, setNewDetail] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIconUrl(initialData.iconUrl || "");
      setDetails(initialData.details?.map(d => d.content) || []);
    } else {
      setName("");
      setIconUrl("");
      setDetails([]);
    }
    setNewDetail("");
  }, [initialData, open]);

  const handleAddDetail = () => {
    if (!newDetail.trim()) return;
    if (details.includes(newDetail.trim())) return;
    setDetails([...details, newDetail.trim()]);
    setNewDetail("");
  };

  const handleRemoveDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ 
      name: name.trim(),
      iconUrl: iconUrl.trim() || null,
      details: details
    });
  };

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
            className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">
                {initialData ? "Sửa tiện nghi" : "Thêm tiện nghi mới"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-slate-500">
                    Tên tiện nghi
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: WiFi miễn phí..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-slate-500">
                    Icon URL / Class
                  </label>
                  <input
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="Ví dụ: wifi, fa-wifi..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Chi tiết tiện nghi
                </label>
                
                <div className="flex gap-2">
                  <input
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDetail())}
                    placeholder="Nhập chi tiết (VD: Băng thông 100Mbps)"
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="inline-flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-all hover:bg-orange-200"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>

                <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
                  {details.length === 0 ? (
                    <p className="py-4 text-center text-xs font-medium text-slate-400">
                      Chưa có chi tiết nào được thêm.
                    </p>
                  ) : (
                    details.map((detail, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2"
                      >
                        <span className="text-sm font-semibold text-slate-700">{detail}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(index)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 rounded-2xl bg-orange-600 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:opacity-50"
                >
                  {initialData ? "Lưu thay đổi" : "Tạo tiện nghi"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
