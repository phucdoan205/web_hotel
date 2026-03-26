import React, { useState } from "react";
import InventoryStats from "../../components/housekeeping/inventory/InventoryStats";
import InventoryTabs from "../../components/housekeeping/inventory/InventoryTabs";
import InventoryTable from "../../components/housekeeping/inventory/InventoryTable";

const HousekeepingInventoryManagementPage = () => {
  const [activeTab, setActiveTab] = useState("amenities");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Quản lý vật tư & Kho
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Hệ thống quản lý Housekeeping MS
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm kiếm vật tư..."
              className="bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
              🔍
            </span>
          </div>
          <button className="bg-blue-50 text-[#0085FF] p-2.5 rounded-xl hover:bg-blue-100 transition-all">
            ⚙️
          </button>
          <button className="flex items-center gap-2 bg-[#0085FF] text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:shadow-lg hover:shadow-blue-100 transition-all">
            📤 Xuất báo cáo
          </button>
        </div>
      </header>

      <InventoryStats />

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <InventoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <InventoryTable />
      </div>
    </div>
  );
};

export default HousekeepingInventoryManagementPage;
