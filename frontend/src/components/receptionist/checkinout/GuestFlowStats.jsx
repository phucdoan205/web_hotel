import React from "react";
import { CalendarDays, LogIn, LogOut } from "lucide-react";

const stats = [
  {
    key: "schedule",
    label: "Lịch hôm nay",
    icon: CalendarDays,
    iconClassName: "bg-sky-50 text-sky-500",
  },
  {
    key: "checkIn",
    label: "Check in",
    icon: LogIn,
    iconClassName: "bg-emerald-50 text-emerald-500",
  },
  {
    key: "checkOut",
    label: "Check out",
    icon: LogOut,
    iconClassName: "bg-orange-50 text-orange-500",
  },
];

const GuestFlowStats = ({ scheduleCount = 0, checkInCount = 0, checkOutCount = 0 }) => {
  const values = {
    schedule: scheduleCount,
    checkIn: checkInCount,
    checkOut: checkOutCount,
  };

  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-4 rounded-2xl border border-gray-50 bg-white px-6 py-4 shadow-sm"
        >
          <div className={`rounded-xl p-2.5 ${item.iconClassName}`}>
            <item.icon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {item.label}
            </p>
            <p className="text-xl font-black text-gray-900">{values[item.key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuestFlowStats;
