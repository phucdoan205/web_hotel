import React from "react";
import { Utensils, Sparkles, Plane, Map } from "lucide-react";

const ServiceItem = ({ icon: Icon, name, revenue, trend, colorClass }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-gray-900">{name}</h4>
        <p className="text-[10px] font-medium text-gray-400">
          {revenue} Revenue
        </p>
      </div>
    </div>
    <span
      className={`text-[10px] font-black ${trend > 0 ? "text-emerald-500" : "text-rose-500"}`}
    >
      {trend > 0 ? "+" : ""}
      {trend}%
    </span>
  </div>
);

const TopServices = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full lg:w-[380px]">
      <h3 className="font-bold text-gray-900 text-lg mb-6">
        Top Performing Services
      </h3>
      <div className="space-y-3">
        <ServiceItem
          icon={Utensils}
          name="Restaurant & F&B"
          revenue="$24,450.00"
          trend={8}
          colorClass="bg-blue-50 text-blue-500"
        />
        <ServiceItem
          icon={Sparkles}
          name="Wellness & Spa"
          revenue="$12,850.00"
          trend={15}
          colorClass="bg-indigo-50 text-indigo-500"
        />
        <ServiceItem
          icon={Plane}
          name="Airport Transfers"
          revenue="$4,120.00"
          trend={-3}
          colorClass="bg-emerald-50 text-emerald-500"
        />
        <ServiceItem
          icon={Map}
          name="Guided Tours"
          revenue="$8,700.00"
          trend={22}
          colorClass="bg-orange-50 text-orange-500"
        />
      </div>
    </div>
  );
};

export default TopServices;
