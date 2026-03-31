import React from "react";

const StatCard = ({
  label,
  value,
  subtext,
  icon,
  bgColor,
  iconColor,
  trend,
}) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-1">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`size-12 rounded-2xl ${bgColor} flex items-center justify-center text-xl`}
      >
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    <p className="text-[10px] font-bold text-gray-400 mt-1">{subtext}</p>
  </div>
);

const InventoryStats = () => (
  <div className="flex gap-6 mb-8">
    <StatCard
      label="Tổng số mặt hàng"
      value="1,250"
      subtext="+2% so với tháng trước"
      icon="📦"
      bgColor="bg-blue-50"
      trend="+2%"
    />
    <StatCard
      label="Vật tư sắp hết"
      value="12"
      subtext="Cần nhập thêm sớm"
      icon="⚠️"
      bgColor="bg-orange-50"
    />
    <StatCard
      label="Giá trị kho"
      value="450.00Mđ"
      subtext="-3% giá trị tồn"
      icon="💰"
      bgColor="bg-indigo-50"
      trend="-3%"
    />
    <StatCard
      label="Yêu cầu mới"
      value="5"
      subtext="Đang chờ phê duyệt"
      icon="📋"
      bgColor="bg-purple-50"
    />
  </div>
);

export default InventoryStats;
