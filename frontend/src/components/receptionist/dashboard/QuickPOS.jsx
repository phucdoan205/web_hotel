import React from "react";
import {
  Utensils,
  ConciergeBell,
  CreditCard,
  ChevronRight,
} from "lucide-react";

const QuickPOS = () => {
  const services = [
    {
      label: "Order Food",
      desc: "Send to Restaurant",
      icon: Utensils,
      color: "bg-orange-50 text-orange-500",
    },
    {
      label: "Room Service",
      desc: "Request Cleaning/Support",
      icon: ConciergeBell,
      color: "bg-indigo-50 text-indigo-500",
    },
    {
      label: "Service Payment",
      desc: "Bill to Guest Folio",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-500",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm">
      <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.15em] mb-6">
        Quick POS Service
      </h3>
      <div className="space-y-3">
        {services.map((item, idx) => (
          <button
            key={idx}
            className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] border border-gray-50 hover:border-blue-100 hover:bg-blue-50/20 transition-all group"
          >
            <div
              className={`p-3 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}
            >
              <item.icon size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                {item.label}
              </p>
              <p className="text-[10px] font-bold text-gray-400">{item.desc}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPOS;
