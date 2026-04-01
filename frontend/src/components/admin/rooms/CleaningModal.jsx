// src/components/admin/rooms/CleaningModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const cleaningOptions = [
  { value: 'Dirty', label: 'Dirty (Cần dọn)' },
  { value: 'InProgress', label: 'In Progress (Đang dọn)' },
  { value: 'Clean', label: 'Clean (Đã dọn)' },
  { value: 'Inspected', label: 'Inspected (Đã kiểm tra)' },
  { value: 'Pickup', label: 'Pickup (Dọn nhẹ)' },
];

export default function CleaningModal({ open, room, onClose, onSave }) {
  const [status, setStatus] = useState(room?.cleaningStatus || 'Dirty');

  const handleSave = () => {
    onSave(status);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">Cập nhật trạng thái dọn phòng</h2>
            <p className="text-sm text-gray-500 mt-1">
              Phòng: <span className="font-bold text-orange-600">#{room?.roomNumber}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X className="size-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Trạng thái dọn phòng
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold 
                         focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            >
              {cleaningOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all"
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>
    </div>
  );
}