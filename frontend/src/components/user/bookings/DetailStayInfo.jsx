import React from "react";
import { CalendarDays } from "lucide-react";

const DetailStayInfo = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-blue-50 rounded-xl text-[#0085FF]">
        <CalendarDays size={18} />
      </div>
      <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-widest">
        Stay Information
      </h4>
    </div>

    <div className="flex justify-between items-center relative">
      {/* Cột Check-in */}
      <div className="flex-1">
        <p className="text-[9px] font-black text-gray-300 uppercase mb-2">
          Check-in
        </p>
        <p className="text-lg font-black text-gray-900">Fri, 20 Oct 2023</p>
        <p className="text-[11px] font-bold text-gray-400 mt-1">
          From 14:00 PM
        </p>
      </div>

      {/* Đường nối & Số đêm */}
      <div className="flex flex-col items-center px-8">
        <div className="px-4 py-1.5 bg-blue-50 text-[#0085FF] text-[10px] font-black rounded-full border border-blue-100 z-10">
          2 Nights Stay
        </div>
        <div className="w-48 h-px bg-gray-100 absolute top-1/2 -translate-y-1/2"></div>
        <p className="text-[10px] font-bold text-gray-300 mt-3 italic">
          Deluxe King Room
        </p>
      </div>

      {/* Cột Check-out */}
      <div className="flex-1 text-right">
        <p className="text-[9px] font-black text-gray-300 uppercase mb-2">
          Check-out
        </p>
        <p className="text-lg font-black text-gray-900">Sun, 22 Oct 2023</p>
        <p className="text-[11px] font-bold text-gray-400 mt-1">
          Before 12:00 PM
        </p>
      </div>
    </div>
  </div>
);

export default DetailStayInfo;
