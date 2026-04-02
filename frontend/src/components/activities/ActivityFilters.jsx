import React from "react";
import { Layers, Camera, Map, Wrench, Trophy, HeartPulse } from "lucide-react";

const FilterBtn = ({ icon, label, active }) => {
  const Icon = icon;
  return (
    <button
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-bold whitespace-nowrap ${
        active
          ? "bg-blue-100 border-blue-500 text-blue-600"
          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

const ActivityFilters = () => {
  const filters = [
    { icon: Layers, label: "All", active: true },
    { icon: Camera, label: "Tours" },
    { icon: Map, label: "Attractions" },
    { icon: Wrench, label: "Workshops" },
    { icon: Trophy, label: "Sports" },
    { icon: HeartPulse, label: "Wellness" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto py-8 no-scrollbar">
      {filters.map((f, i) => (
        <FilterBtn key={i} {...f} />
      ))}
    </div>
  );
};

export default ActivityFilters;
