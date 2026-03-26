import React from "react";
import { UserPlus, FileDown } from "lucide-react";
import { useGuestData } from "../../hooks/useGuestData"; // Import hook
import GuestFilters from "../../components/receptionist/guests/GuestFilters";
import GuestTable from "../../components/receptionist/guests/GuestTable";

const ReceptionistGuestManagementPage = () => {
  // Sử dụng Hook để lấy toàn bộ logic
  const { search, setSearch, activeTab, setActiveTab, filteredGuests } =
    useGuestData();

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Quản lý Khách hàng
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Hệ thống theo dõi thông tin và lịch sử lưu trú của khách hàng.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-all">
            <FileDown size={14} className="text-gray-400" /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#0085FF] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
            <UserPlus size={16} strokeWidth={3} /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Filters */}
      <GuestFilters
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Table */}
      <GuestTable data={filteredGuests} />

      <div className="px-4 flex justify-between items-center">
        <p className="text-[11px] font-bold text-gray-400">
          Showing 1 to {filteredGuests.length} of 150 entries
        </p>
      </div>
    </div>
  );
};

export default ReceptionistGuestManagementPage;
