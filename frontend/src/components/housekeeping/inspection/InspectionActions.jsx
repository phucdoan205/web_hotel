import React from "react";
import { Plus, Check, AlertTriangle } from "lucide-react";

const EvidenceUpload = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="size-5 bg-[#0085FF] rounded-lg flex items-center justify-center text-white text-[10px]">
        📷
      </div>
      <h3 className="text-[11px] font-black text-gray-900 uppercase">
        Hình ảnh minh chứng
      </h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=150"
          className="w-full h-full object-cover"
        />
      </div>
      <button className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-[#0085FF] hover:text-[#0085FF] transition-all">
        <Plus size={20} />
        <span className="text-[9px] font-black uppercase">Thêm ảnh</span>
      </button>
    </div>
    <p className="text-[9px] font-bold text-gray-400 mt-4 italic text-center">
      Chụp ít nhất 2 ảnh (Nhà tắm, Giường) để đảm bảo chất lượng.
    </p>
  </div>
);

const InspectionActions = ({ progress }) => (
  <div className="space-y-3">
    <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-100">
      <Check size={18} /> ĐẠT YÊU CẦU (PASS)
    </button>
    <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-100">
      <AlertTriangle size={18} /> CẦN DỌN LẠI (FAIL)
    </button>
    <div className="grid grid-cols-2 gap-3 pt-2">
      <button className="bg-gray-50 text-gray-500 py-3 rounded-xl font-black text-[10px] hover:bg-gray-100 transition-all uppercase">
        Lưu bản nháp
      </button>
      <button className="bg-white border border-gray-100 text-gray-400 py-3 rounded-xl font-black text-[10px] hover:bg-rose-50 hover:text-rose-500 transition-all uppercase">
        Hủy bỏ
      </button>
    </div>
    <div className="mt-6">
      <div className="flex justify-between text-[9px] font-black text-gray-400 mb-2 uppercase">
        <span>Tiến độ kiểm tra</span>
        <span>{progress}% Hoàn thành</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0085FF] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

export { EvidenceUpload, InspectionActions };
