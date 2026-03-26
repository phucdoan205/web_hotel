import React from "react";
import {
  ClipboardList,
  CheckCircle2,
  Brush,
  Wrench,
  AlertCircle,
} from "lucide-react";
import StatCard from "../../components/housekeeping/dashboard/StatCard";
import InventoryStatus from "../../components/housekeeping/dashboard/InventoryStatus";
import PriorityTask from "../../components/housekeeping/dashboard/PriorityTask";
import StaffPerformance from "../../components/housekeeping/dashboard/StaffPerformance";

const HousekeepingDashboardPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <header>
        <h1 className="text-2xl font-black text-gray-900">
          Tổng quan Dọn phòng
        </h1>
        <p className="text-xs font-bold text-gray-400 mt-1">
          Hôm nay, ngày 24 tháng 10 năm 2024
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ClipboardList}
          label="Phòng cần dọn"
          value="45"
          subtext="12 phòng mới check-out"
          colorClass={{
            bg: "bg-blue-50",
            text: "text-blue-500",
            subText: "text-blue-400",
          }}
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã hoàn thành"
          value="28"
          progress={62}
          colorClass={{ bg: "bg-emerald-50", text: "text-emerald-500" }}
        />
        <StatCard
          icon={Brush}
          label="Đang dọn dẹp"
          value="07"
          subtext="Đang thực hiện bởi 4 nhân viên"
          colorClass={{
            bg: "bg-orange-50",
            text: "text-orange-500",
            subText: "text-orange-400",
          }}
        />
        <StatCard
          icon={Wrench}
          label="Cần bảo trì"
          value="10"
          subtext="⚠ 3 phòng hỏng máy lạnh"
          colorClass={{
            bg: "bg-rose-50",
            text: "text-rose-500",
            subText: "text-rose-500",
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ưu tiên dọn dẹp (Urgent Tasks) */}
          <PriorityTask />

          {/* Hiệu suất nhân viên (Staff Performance) */}
          <StaffPerformance />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <InventoryStatus />

          {/* Mẹo tối ưu */}
          <div className="bg-blue-50/50 p-6 rounded-4xl border border-blue-100">
            <div className="flex items-center gap-3 mb-3 text-[#0085FF]">
              <AlertCircle size={18} />
              <p className="text-[11px] font-black uppercase">
                Mẹo tối ưu hôm nay
              </p>
            </div>
            <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
              Nên tập trung nhân lực dọn tầng 3 trước vì có 5 đoàn khách
              check-in sớm vào lúc 12:30.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingDashboardPage;
