import React from "react";
import { Download, Calendar } from "lucide-react";
import ReportStats from "../../components/admin/reports/ReportStats";
import RevenueTrends from "../../components/admin/reports/RevenueTrends";
import BookingSources from "../../components/admin/reports/BookingSources";
import MonthlySummary from "../../components/admin/reports/MonthlySummary";
import TopServices from "../../components/admin/reports/TopServices";

const AdminReportsPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Monitor your property's real-time performance and financial health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 shadow-sm">
            <Calendar className="size-4" /> Oct 1, 2023 - Oct 31, 2023
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 rounded-2xl text-[11px] font-black text-white shadow-lg shadow-blue-100">
            <Download className="size-4" /> Export Report
          </button>
        </div>
      </div>

      <ReportStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RevenueTrends />
        <BookingSources />
      </div>

      {/* Bạn có thể thêm component MonthlySummary và TopServices ở đây */}
      <div className="flex flex-col lg:flex-row gap-8">
        <MonthlySummary />
        <TopServices />
      </div>
    </div>
  );
};

export default AdminReportsPage;
