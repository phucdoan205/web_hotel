import React from "react";
import { Bed, Users, Wrench, CheckCircle } from "lucide-react";

const StatBox = ({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass,
  borderColor,
}) => (
  <div
    className={`bg-white p-5 rounded-2xl border-l-4 ${borderColor} shadow-sm border-y border-r border-gray-100 flex justify-between items-center flex-1`}
  >
    <div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-black text-gray-900">{value}</span>
        <span className="text-[10px] font-bold text-gray-400">Total units</span>
      </div>
      {subValue && (
        <span className="text-[10px] font-bold text-emerald-500 mt-1 block">
          {subValue}
        </span>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="size-5" />
    </div>
  </div>
);

const RoomStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatBox
        label="Total Rooms"
        value="124"
        icon={Bed}
        colorClass="bg-slate-50 text-slate-500"
        borderColor="border-slate-400"
      />
      <StatBox
        label="Occupied"
        value="86"
        subValue="+5% today"
        icon={Users}
        colorClass="bg-orange-50 text-orange-600"
        borderColor="border-orange-500"
      />
      <StatBox
        label="Maintenance"
        value="8"
        subValue="2 urgent"
        icon={Wrench}
        colorClass="bg-amber-50 text-amber-600"
        borderColor="border-amber-500"
      />
      <StatBox
        label="Available"
        value="30"
        subValue="-3% today"
        icon={CheckCircle}
        colorClass="bg-slate-50 text-slate-900"
        borderColor="border-slate-900"
      />
    </div>
  );
};

export default RoomStats;
