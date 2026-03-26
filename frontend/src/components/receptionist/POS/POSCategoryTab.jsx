import React from "react";
import { Utensils, Bed, Sparkles, Shirt } from "lucide-react";

const POSCategoryTab = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "Food", label: "Food", icon: <Utensils size={18} /> },
    { id: "Room Service", label: "Room Service", icon: <Bed size={18} /> },
    { id: "Spa", label: "Spa", icon: <Sparkles size={18} /> },
    { id: "Laundry", label: "Laundry", icon: <Shirt size={18} /> },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all duration-300 whitespace-nowrap
            ${
              activeTab === tab.id
                ? "bg-[#0085FF] text-white shadow-xl shadow-blue-100 scale-105"
                : "bg-white text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-100 shadow-sm"
            }
          `}
        >
          <span
            className={activeTab === tab.id ? "text-white" : "text-blue-500"}
          >
            {tab.icon}
          </span>
          <span className="uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default POSCategoryTab;
