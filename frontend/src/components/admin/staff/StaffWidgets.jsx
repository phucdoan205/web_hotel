import React from "react";
import { Users, CheckCircle, UserMinus } from "lucide-react";

const WidgetCard = ({ icon, label, value, colorClass }) => {
  const IconComponent = icon;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 flex-1">
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <IconComponent className="size-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400">{label}</span>
        <span className="text-xl font-black text-gray-900">{value}</span>
      </div>
    </div>
  );
};

const StaffWidgets = ({ totalCount, activeCount, deletedCount }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8">
      <WidgetCard
        icon={Users}
        label="Tổng nhân sự"
        value={totalCount}
        colorClass="bg-orange-50 text-orange-600"
      />
      <WidgetCard
        icon={CheckCircle}
        label="Nhân sự đang hoạt động"
        value={activeCount}
        colorClass="bg-emerald-50 text-emerald-600"
      />
      <WidgetCard
        icon={UserMinus}
        label="Nhân sự đã khóa"
        value={deletedCount}
        colorClass="bg-rose-50 text-rose-600"
      />
    </div>
  );
};

export default StaffWidgets;
