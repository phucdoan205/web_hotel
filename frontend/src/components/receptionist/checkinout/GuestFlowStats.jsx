import React from "react";
import { LogIn, LogOut } from "lucide-react";

const GuestFlowStats = () => (
  <div className="flex gap-4">
    <div className="bg-white px-6 py-4 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4">
      <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-xl">
        <LogIn size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Arrivals
        </p>
        <p className="text-xl font-black text-gray-900">24</p>
      </div>
    </div>
    <div className="bg-white px-6 py-4 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4">
      <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl">
        <LogOut size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Departures
        </p>
        <p className="text-xl font-black text-gray-900">18</p>
      </div>
    </div>
  </div>
);

export default GuestFlowStats;
