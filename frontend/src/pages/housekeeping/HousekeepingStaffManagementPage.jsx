import React from "react";
import StaffStats from "../../components/housekeeping/staff/StaffStats";
import ShiftSchedule from "../../components/housekeeping/staff/ShiftSchedule";
import StaffTable from "../../components/housekeeping/staff/StaffTable";

const HousekeepingStaffManagementPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Nhân sự & Ca làm
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Quản lý lịch trình và phân công nhân sự buồng phòng
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all">
            📅 Sắp lịch ca
          </button>
          <button className="flex items-center gap-2 bg-[#0085FF] text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all">
            ➕ Thêm nhân sự
          </button>
        </div>
      </header>

      <StaffStats />
      <ShiftSchedule />
      <StaffTable />
    </div>
  );
};

export default HousekeepingStaffManagementPage;
