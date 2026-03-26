import React from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

const RoomFilter = ({ setFilterFloor }) => {
  const statusItems = [
    { label: "AVAILABLE (14)", color: "bg-emerald-500" },
    { label: "OCCUPIED (22)", color: "bg-blue-500" },
    { label: "DIRTY (5)", color: "bg-amber-500" },
    { label: "MAINTENANCE (2)", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {/* Dropdown Tầng */}
          <div className="relative group">
            <select
              onChange={(e) => setFilterFloor(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-xl px-5 py-2.5 pr-10 text-xs font-black text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
            >
              <option>All Floors</option>
              <option>Floor 1</option>
              <option>Floor 2</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Dropdown Loại phòng */}
          <div className="relative group">
            <select className="appearance-none bg-white border border-gray-100 rounded-xl px-5 py-2.5 pr-10 text-xs font-black text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer">
              <option>All Types</option>
              <option>Deluxe King</option>
              <option>Suite</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <button className="flex items-center gap-2 bg-[#0085FF] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95">
            <RefreshCw size={14} strokeWidth={3} /> Refresh
          </button>
        </div>
      </div>

      {/* Legend - Chú thích trạng thái */}
      <div className="flex flex-wrap gap-8 bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`size-2.5 rounded-full ${item.color} shadow-sm`} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomFilter;
