import React from "react";
import { Search, Plus } from "lucide-react";
import StaffTable from "../../components/admin/staff/StaffTable";
import StaffWidgets from "../../components/admin/staff/StaffWidgets";

const AdminStaffPage = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Search bar tích hợp trong header (dựa trên ảnh) */}
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full pl-11 pr-4 py-3 bg-gray-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 rounded-2xl text-sm font-bold text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">
          <Plus className="size-5" />
          Add New Staff
        </button>
      </div>

      <div className="mt-8">
        <h1 className="text-3xl font-black text-gray-900">Staff Management</h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          Manage and monitor your hotel staff performance and status.
        </p>
      </div>

      {/* Main Table Area */}
      <StaffTable />

      {/* Footer Widgets */}
      <StaffWidgets />
    </div>
  );
};

export default AdminStaffPage;
