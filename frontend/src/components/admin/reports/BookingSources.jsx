import React from "react";

const SourceBar = ({ label, percentage, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[11px] font-bold">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{percentage}%</span>
    </div>
    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const BookingSources = () => (
  <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col">
    <h3 className="font-bold text-gray-900 text-lg mb-8">Bookings by Source</h3>
    <div className="space-y-6 flex-1 justify-center flex flex-col">
      <SourceBar label="Direct Website" percentage={42} color="bg-blue-500" />
      <SourceBar label="Traveloka" percentage={28} color="bg-sky-400" />
      <SourceBar label="Booking.com" percentage={18} color="bg-indigo-400" />
      <SourceBar label="Expedia" percentage={12} color="bg-slate-300" />
    </div>
  </div>
);

export default BookingSources;
