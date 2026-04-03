import React from "react";

const InventoryTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "amenities", label: "Vật tư tiêu hao (Amenities)" },
    { id: "linens", label: "Đồ vải (Linens)" },
    { id: "chemicals", label: "Hóa chất dọn dẹp" },
    { id: "tools", label: "Công cụ dụng cụ" },
  ];

  return (
    <div className="flex items-center justify-between mb-6 border-b border-gray-100">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-tight transition-all relative ${
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
      <div className="flex gap-2 pb-2">
        <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 hover:bg-gray-50 uppercase">
          Lọc dữ liệu
        </button>
        <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 hover:bg-gray-50 uppercase">
          Sắp xếp
        </button>
      </div>
    </div>
  );
};

export default InventoryTabs;
