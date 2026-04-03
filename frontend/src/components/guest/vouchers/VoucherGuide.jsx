import React from "react";
import { HelpCircle, ChevronRight } from "lucide-react";

const VoucherGuide = () => {
  return (
    <div className="bg-blue-50/40 border border-dashed border-blue-200 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="flex items-center gap-6">
        {/* Icon hỗ trợ */}
        <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-[#0085FF] shadow-sm shadow-blue-100">
          <HelpCircle size={24} strokeWidth={2.5} />
        </div>

        <div>
          <h4 className="text-[14px] font-black text-gray-900">
            How to use vouchers?
          </h4>
          <p className="text-[11px] font-bold text-gray-400 mt-1">
            Learn how to redeem your codes during the checkout process.
          </p>
        </div>
      </div>

      {/* Nút hành động bên phải */}
      <button className="flex items-center gap-2 text-[#0085FF] text-[11px] font-black hover:gap-3 transition-all">
        View Guide
        <ChevronRight size={14} strokeWidth={3} />
      </button>
    </div>
  );
};

export default VoucherGuide;
