import React from "react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass,
  progress,
}) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass.bg}`}>
        <Icon size={24} className={colorClass.text} />
      </div>
      {progress && (
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
          {progress}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </p>
    <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
    {subtext && (
      <p className={`text-[10px] font-bold mt-2 ${colorClass.subText}`}>
        {subtext}
      </p>
    )}
  </div>
);

export default StatCard;
