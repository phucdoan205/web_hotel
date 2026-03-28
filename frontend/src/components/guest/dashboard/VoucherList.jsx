import React from "react";
import { Ticket } from "lucide-react";

const VoucherCard = ({ title, code, expiry, isOrange }) => (
  <div
    className={`p-4 rounded-3xl border-2 border-dashed flex items-center justify-between transition-all ${
      isOrange
        ? "bg-orange-50/30 border-orange-100"
        : "bg-blue-50/30 border-blue-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`size-10 rounded-2xl flex items-center justify-center ${isOrange ? "bg-orange-100 text-orange-500" : "bg-blue-100 text-[#0085FF]"}`}
      >
        <Ticket size={18} />
      </div>
      <div>
        <h4 className="text-[11px] font-black text-gray-900">{title}</h4>
        <p className="text-[9px] font-bold text-gray-400">Exp: {expiry}</p>
      </div>
    </div>
    <div
      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest bg-white shadow-sm border border-gray-50 ${isOrange ? "text-orange-500" : "text-[#0085FF]"}`}
    >
      {code}
    </div>
  </div>
);

const VoucherList = () => (
  <div className="space-y-4">
    <VoucherCard title="15% Off Stay" code="TRAVEL15" expiry="Dec 31, 2023" />
    <VoucherCard
      title="Free Breakfast"
      code="YUMMYSTAY"
      expiry="Nov 15, 2023"
      isOrange
    />
  </div>
);

export default VoucherList;
