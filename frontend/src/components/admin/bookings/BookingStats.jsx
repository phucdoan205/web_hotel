import React from "react";

const StatCard = ({ label, value, subValue, subColor }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
      {label}
    </span>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-gray-900">{value}</span>
      <span className={`text-xs font-bold ${subColor}`}>{subValue}</span>
    </div>
  </div>
);

const BookingStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Bookings"
        value="1,284"
        subValue="+12%"
        subColor="text-emerald-500"
      />
      <StatCard
        label="Confirmed"
        value="856"
        subValue="+5%"
        subColor="text-emerald-500"
      />
      <StatCard
        label="Occupancy"
        value="92%"
        subValue="Full"
        subColor="text-orange-500"
      />
      <StatCard
        label="Net Revenue"
        value="$42.5k"
        subValue="+18%"
        subColor="text-emerald-500"
      />
    </div>
  );
};

export default BookingStats;
