import React from "react";

const StatItem = ({ label, value, trend, iconColor, bgColor }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`size-10 rounded-xl ${bgColor} flex items-center justify-center`}
      >
        <span className={`text-lg ${iconColor}`}>📋</span>
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
        {trend}
      </span>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
  </div>
);

const TaskStats = () => (
  <div className="flex gap-6 mb-8">
    <StatItem
      label="Tổng nhiệm vụ"
      value="45"
      trend="+5%"
      iconColor="text-blue-500"
      bgColor="bg-blue-50"
    />
    <StatItem
      label="Đã hoàn thành"
      value="28"
      trend="+2%"
      iconColor="text-emerald-500"
      bgColor="bg-emerald-50"
    />
    <StatItem
      label="Đang thực hiện"
      value="10"
      trend="+3%"
      iconColor="text-orange-500"
      bgColor="bg-orange-50"
    />
    <StatItem
      label="Chưa bắt đầu"
      value="07"
      trend="-1%"
      iconColor="text-gray-400"
      bgColor="bg-gray-100"
    />
  </div>
);

export default TaskStats;
