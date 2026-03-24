import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, trend, isPositive }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {title}
    </p>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <div
      className={`flex items-center gap-1 text-[11px] font-black ${isPositive ? "text-emerald-500" : "text-rose-500"}`}
    >
      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      <span>{trend}</span>
    </div>
  </div>
);

const StatsCards = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,200",
      trend: "+12.4%",
      isPositive: true,
    },
    {
      title: "Occupancy Rate",
      value: "78.5%",
      trend: "+5.2%",
      isPositive: true,
    },
    { title: "ADR", value: "$120.50", trend: "-2.1%", isPositive: false },
    { title: "New Bookings", value: "142", trend: "+8.7%", isPositive: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
};

export default StatsCards;
