import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Availability = () => {
  const roomTypes = [
    { label: "Standard King", count: "45/50", percent: 90 },
    { label: "Deluxe Suite", count: "12/20", percent: 60 },
    { label: "Presidential", count: "2/5", percent: 40 },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.15em]">
          Availability
        </h3>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-gray-50 rounded-lg text-gray-400">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1 hover:bg-gray-50 rounded-lg text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">
        October 24 - 30, 2023
      </p>

      <div className="space-y-8">
        {roomTypes.map((room, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
              <span className="text-gray-900">{room.label}</span>
              <span className="text-blue-500">{room.count}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${room.percent}%` }}
              />
            </div>
          </div>
        ))}
        <button className="w-full mt-4 py-4 border border-blue-100 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-blue-50 transition-all shadow-sm">
          View Full Calendar
        </button>
      </div>
    </div>
  );
};

export default Availability;
