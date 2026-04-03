import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, trend, icon: Icon, colorClass }) => {
  const isPositive = trend > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="size-6" />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
        >
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
