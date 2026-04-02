import React from "react";
import { Utensils, Sparkles, ConciergeBell, Brush } from "lucide-react";

const ServiceCard = ({
  title,
  description,
  status,
  icon,
  colorClass,
}) => {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
      <div
        className={`p-4 rounded-2xl mb-4 ${colorClass} group-hover:scale-110 transition-transform`}
      >
        <Icon className="size-6" />
      </div>

      <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed mb-4">
        {description}
      </p>

      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
        <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
          {status}
        </span>
      </div>
    </div>
  );
};

export default ServiceCard;
