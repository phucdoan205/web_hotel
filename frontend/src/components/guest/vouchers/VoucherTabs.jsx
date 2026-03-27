import React, { useState } from "react";

const VoucherTabs = () => {
  const [activeTab, setActiveTab] = useState("Active");

  const tabs = [
    { name: "Active", count: 4 },
    { name: "Used", count: null },
    { name: "Expired", count: null },
  ];

  return (
    <div className="flex gap-10 border-b border-gray-100 mb-10">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`pb-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === tab.name
              ? "text-[#0085FF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {/* Hiển thị tên tab và số lượng nếu có */}
          {tab.name}{" "}
          {tab.count !== null && (
            <span className="ml-1 opacity-70">({tab.count})</span>
          )}
          {/* Thanh highlight dưới tab đang chọn */}
          {activeTab === tab.name && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0085FF] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default VoucherTabs;
