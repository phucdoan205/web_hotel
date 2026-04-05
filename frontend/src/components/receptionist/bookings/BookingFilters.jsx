// src/components/receptionist/bookings/BookingFilters.jsx
import React from "react";
import { Search, Calendar, Filter, Plus } from "lucide-react";

const BookingFilters = ({ filters, onFilterChange, onOpenCreate }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Tìm theo Booking ID, Tên khách hoặc Phòng..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:bg-white outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={filters.checkInFrom}
              onChange={(e) => onFilterChange("checkInFrom", e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm w-40 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="CheckedIn">Checked In</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.roomTypeId}
            onChange={(e) => onFilterChange("roomTypeId", e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:border-blue-500"
          >
            <option value="">Tất cả loại phòng</option>
            {/* Bạn có thể load từ API sau */}
            <option value="1">Deluxe</option>
            <option value="2">Standard</option>
            <option value="3">Suite</option>
          </select>
        </div>

        {/* Button Thêm Booking */}
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-200"
        >
          <Plus size={18} />
          Thêm Booking Mới
        </button>
      </div>
    </div>
  );
};

export default BookingFilters;