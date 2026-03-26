import React from "react";

const SettingsTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "hotel", label: "Hồ sơ khách sạn" },
    { id: "personal", label: "Tài khoản cá nhân" },
    { id: "system", label: "Thiết lập hệ thống" },
  ];

  return (
    <div className="flex gap-8 border-b border-gray-100 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`pb-4 text-xs font-black transition-all relative ${
            activeTab === tab.id
              ? "text-[#0085FF]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0085FF] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;
