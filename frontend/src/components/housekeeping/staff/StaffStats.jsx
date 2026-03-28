import React from "react";

const StatCard = ({ label, value, trend, trendType, icon }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
    <div className="flex justify-between items-start mb-4">
      <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
        {icon}
      </div>
      <span
        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
          trendType === "up"
            ? "text-emerald-500 bg-emerald-50"
            : "text-rose-500 bg-rose-50"
        }`}
      >
        {trend}
      </span>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
  </div>
);

const StaffStats = () => (
  <div className="flex gap-6 mb-8">
    <StatCard
      label="Tổng nhân sự"
      value="45"
      trend="+2%"
      trendType="up"
      icon="👥"
    />
    <StatCard
      label="Đang làm việc"
      value="28"
      trend="+5%"
      trendType="up"
      icon="⚡"
    />
    <StatCard
      label="Ca làm hôm nay"
      value="12"
      trend="0%"
      trendType="up"
      icon="📅"
    />
    <StatCard
      label="Yêu cầu chờ"
      value="8"
      trend="-12%"
      trendType="down"
      icon="⏳"
    />
  </div>
);

export default StaffStats;
