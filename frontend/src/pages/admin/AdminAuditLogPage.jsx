import React from "react";
import { Search, Download, RefreshCw, Calendar } from "lucide-react";
import AuditTable from "../../components/admin/audit/AuditTable";
import AuditWidgets from "../../components/admin/audit/AuditWidgets";

const AdminAuditLogPage = () => {
  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <RefreshCw className="size-4" />
          </div>
          <h2 className="font-black text-gray-900 uppercase tracking-tight">
            System Audit
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="text"
              placeholder="Global search..."
              className="pl-11 pr-4 py-2 bg-gray-100/50 rounded-xl text-xs outline-none w-48 border border-transparent focus:border-gray-200"
            />
          </div>
          <button className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors">
            <Calendar className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">
          System Activity Logs
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          Monitor all administrative actions and system events in real-time.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search logs by user, action, or IP address..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none"
            />
          </div>
          <select className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-500 outline-none border-none cursor-pointer">
            <option>All Roles</option>
          </select>
          <input
            type="date"
            className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-400 outline-none border-none"
          />
          <select className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-500 outline-none border-none cursor-pointer">
            <option>Success Status</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all">
            <Download className="size-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 rounded-2xl text-xs font-black text-white shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all">
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AuditTable />
      <AuditWidgets />

      {/* Footer Copyright (như trong ảnh) */}
      <div className="pt-12 pb-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50">
        <p>© 2023 Admin ERP Solutions. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <button className="hover:text-orange-600">System Status</button>
          <button className="hover:text-orange-600">Privacy Policy</button>
          <button className="hover:text-orange-600">Support</button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;
