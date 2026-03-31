import React from "react";
import PerformanceStats from "../../components/housekeeping/reports/PerformanceStats";
import ProductivityChart from "../../components/housekeeping/reports/ProductivityChart";
import MaterialUsageTable from "../../components/housekeeping/reports/MaterialUsageTable";

const HousekeepingReportsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Theo dõi hiệu suất và vật tư buồng phòng của khách sạn
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl">
            <span className="text-lg">📅</span>
            <select className="text-[11px] font-black text-gray-600 bg-transparent outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>Tháng này</option>
            </select>
          </div>
          <button className="bg-white border border-gray-100 p-2.5 rounded-xl hover:bg-gray-50 transition-all">
            <span className="opacity-40">🔍</span>
          </button>
        </div>
      </header>

      <PerformanceStats />
      <ProductivityChart />
      <MaterialUsageTable />
    </div>
  );
};

export default HousekeepingReportsPage;
