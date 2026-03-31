import React from "react";

const StatCard = ({ title, value, change, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-3 rounded-2xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-gray-900">{value}</span>
        <span
          className={`text-[10px] font-bold ${change.includes("+") ? "text-emerald-500" : "text-rose-400"}`}
        >
          {change}
        </span>
      </div>
    </div>
  </div>
);

export default StatCard;
