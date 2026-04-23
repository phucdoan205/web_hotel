import React, { useState } from "react";

const ReviewTabs = () => {
  // Trạng thái để xác định tab nào đang được chọn
  const [activeTab, setActiveTab] = useState("All Reviews");

  const tabs = [
    { name: "All Reviews", count: 12 }, // Hiển thị tổng số lượng đánh giá
    { name: "Pending Response", count: null },
  ];

  return (
    <div className="flex gap-10 border-b border-gray-100 mb-10">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`pb-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${
            activeTab === tab.name
              ? "text-[#0085FF]" // Màu xanh chủ đạo cho tab đang hoạt động
              : "text-gray-400 hover:text-gray-600" // Màu xám cho tab không hoạt động
          }`}
        >
          {/* Nội dung nhãn của Tab */}
          {tab.name} {tab.count !== null && `(${tab.count})`}
          {/* Thanh gạch chân (indicator) cho tab đang được chọn */}
          {activeTab === tab.name && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0085FF] rounded-full animate-in fade-in slide-in-from-left-2 duration-300" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ReviewTabs;
