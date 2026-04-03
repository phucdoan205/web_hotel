import React from "react";

const StatCard = ({ label, value, trend, icon, bgColor, trendType }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`size-12 rounded-2xl ${bgColor} flex items-center justify-center text-xl`}
      >
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
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
  </div>
);

const PerformanceStats = () => (
  <div className="flex gap-6 mb-8">
    <StatCard
      label="Tổng số phòng đã dọn"
      value="1,248"
      trend="+12%"
      trendType="up"
      icon="🧹"
      bgColor="bg-blue-50"
    />
    <StatCard
      label="Thời gian dọn trung bình"
      value="25 phút"
      trend="-5%"
      trendType="down"
      icon="⏱️"
      bgColor="bg-orange-50"
    />
    <StatCard
      label="Vật tư đã tiêu thụ"
      value="450 bộ"
      trend="-2%"
      trendType="down"
      icon="📦"
      bgColor="bg-purple-50"
    />
    <StatCard
      label="Đánh giá sạch sẽ"
      value="4.8/5"
      trend="+0.3%"
      trendType="up"
      icon="⭐"
      bgColor="bg-emerald-50"
    />
  </div>
);

export default PerformanceStats;
