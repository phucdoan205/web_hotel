import React from "react";
import { DollarSign, Bed, BarChart3 } from "lucide-react";

const StatCard = ({ label, value, subText, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col flex-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="size-5" />
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend > 0 ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}
      >
        {trend > 0 ? "+" : ""}
        {trend}%
      </span>
    </div>
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-2xl font-black text-gray-900 mt-1">{value}</span>
    <span className="text-[10px] font-medium text-gray-400 mt-1">
      {subText}
    </span>
  </div>
);

const ReportStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard
      label="Total Revenue"
      value="$128,450.00"
      subText="vs $114,178 last month"
      trend={12.5}
      icon={DollarSign}
      colorClass="bg-blue-50 text-blue-500"
    />
    <StatCard
      label="Occupancy Rate"
      value="84.2%"
      subText="Target: 88.0%"
      trend={-2.1}
      icon={Bed}
      colorClass="bg-orange-50 text-orange-500"
    />
    <StatCard
      label="RevPAR"
      value="$108.50"
      subText="Market Avg: $92.30"
      trend={5.4}
      icon={BarChart3}
      colorClass="bg-indigo-50 text-indigo-500"
    />
  </div>
);

export default ReportStats;
