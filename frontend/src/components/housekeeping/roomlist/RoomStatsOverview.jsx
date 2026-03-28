import React from "react";

const StatCard = ({ label, value, trend, trendValue }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <div className="flex items-baseline gap-4 mt-2">
      <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      <span
        className={`text-[10px] font-black ${trend === "up" ? "text-rose-500" : trend === "down" ? "text-orange-500" : "text-emerald-500"}`}
      >
        {trend === "up" ? "↑" : trend === "down" ? "↓" : "~"} {trendValue}
      </span>
    </div>
  </div>
);

const RoomStatsOverview = () => (
  <div className="flex gap-6 mb-8">
    <StatCard
      label="Tổng số phòng"
      value="120"
      trend="stable"
      trendValue="0%"
    />
    <StatCard label="Cần dọn dẹp" value="45" trend="up" trendValue="+15%" />
    <StatCard label="Đang dọn dẹp" value="12" trend="down" trendValue="-5%" />
    <StatCard label="Bảo trì" value="5" trend="down" trendValue="-2%" />
  </div>
);

export default RoomStatsOverview;
