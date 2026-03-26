import React from "react";
import { UserPlus, CheckCircle, Briefcase } from "lucide-react";

const WidgetCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 flex-1">
    <div className={`p-4 rounded-2xl ${colorClass}`}>
      <Icon className="size-6" />
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-gray-400">{label}</span>
      <span className="text-xl font-black text-gray-900">{value}</span>
    </div>
  </div>
);

const StaffWidgets = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8">
      <WidgetCard
        icon={UserPlus}
        label="New Hires"
        value="12 this month"
        colorClass="bg-orange-50 text-orange-600"
      />
      <WidgetCard
        icon={CheckCircle}
        label="Attendance Rate"
        value="94.2%"
        colorClass="bg-emerald-50 text-emerald-600"
      />
      <WidgetCard
        icon={Briefcase}
        label="Open Positions"
        value="3 active ads"
        colorClass="bg-blue-50 text-blue-600"
      />
    </div>
  );
};

export default StaffWidgets;
