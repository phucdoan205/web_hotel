import React, { useState } from "react";

const BookingFilter = () => {
  const tabs = ["All", "Upcoming", "Completed", "Cancelled"];
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex border-b border-gray-100 gap-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === tab
              ? "text-[#0085FF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0085FF] rounded-full shadow-[0_-2px_8px_rgba(0,133,255,0.4)]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default BookingFilter;
