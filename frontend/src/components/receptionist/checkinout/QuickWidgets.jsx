import React from "react";
import { History, Brush, Plus } from "lucide-react";

export const RecentCheckIns = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">
      <History size={14} className="text-blue-500" /> Recent Check-ins
    </h4>
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">• Michael Chen</span>
        <span className="text-gray-400 font-medium italic">10 mins ago</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">• Sarah Adams</span>
        <span className="text-gray-400 font-medium italic">45 mins ago</span>
      </div>
    </div>
  </div>
);

export const PendingCleanups = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">
      <Brush size={14} className="text-blue-500" /> Pending Cleanups
    </h4>
    <div className="space-y-4">
      {[
        { room: "402 - Suite", status: "In Progress", color: "text-blue-500" },
        { room: "105 - Standard", status: "Waiting", color: "text-gray-400" },
      ].map((item, i) => (
        <div key={i} className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700">{item.room}</span>
          <span
            className={`${item.color} font-black uppercase tracking-tighter text-[9px]`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const WalkInAction = () => (
  <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 flex flex-col items-center justify-center text-center space-y-3">
    <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-200">
      <Plus size={20} strokeWidth={3} />
    </div>
    <div>
      <p className="text-xs font-black text-blue-900 uppercase tracking-tight">
        Quick Add Walk-in
      </p>
      <p className="text-[10px] font-bold text-blue-400 mt-1 px-4 leading-relaxed">
        Create a new booking directly for walk-in guests.
      </p>
    </div>
    <button className="mt-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md">
      Create New
    </button>
  </div>
);
