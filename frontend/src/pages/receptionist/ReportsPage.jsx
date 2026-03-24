import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import StatsCards from "../../components/receptionist/reports/StatsCards";
import BookingSources from "../../components/receptionist/reports/BookingSources";
import RevenueChart from "../../components/receptionist/reports/RevenueChart";
import TopSellingRooms from "../../components/receptionist/reports/TopSellingRooms";

const ReportsPage = () => {
  return (
    <div className="flex-1 p-8 bg-[#F9FAFB] overflow-y-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Báo cáo & Phân tích
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Theo dõi hiệu suất hoạt động của khách sạn thời gian thực.
          </p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <button className="text-gray-400 hover:text-gray-900">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-xs font-black text-gray-700">
            <Calendar size={14} className="text-[#0085FF]" />
            Tháng 10, 2023
          </div>
          <button className="text-gray-400 hover:text-gray-900">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Chỉ số tổng quát */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend (Placeholder cho Chart thực tế) */}
        <RevenueChart />

        {/* Nguồn đặt phòng */}
        <BookingSources />
      </div>

      {/* Top Selling Rooms */}
      <TopSellingRooms />
    </div>
  );
};

export default ReportsPage;
