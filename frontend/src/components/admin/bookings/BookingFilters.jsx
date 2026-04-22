import React from "react";
import { Calendar, Plus, RotateCcw, Search } from "lucide-react";

const BookingFilters = ({ filters, onFilterChange, onOpenCreate, onClearFilters, roomTypes }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 text-sm shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size="18" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Tìm theo Booking ID, tên khách hoặc phòng..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-1 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={filters.checkInFrom}
              onChange={(e) => onFilterChange("checkInDate", e.target.value)}
              className="w-40 rounded-2xl border border-gray-200 bg-gray-50 py-1 pl-10 pr-4 text-sm focus:border-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-1 text-sm focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filters.roomTypeId}
            onChange={(e) => onFilterChange("roomTypeId", e.target.value)}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-1 text-sm focus:border-blue-500"
          >
            <option value="">Tất cả loại phòng</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onClearFilters}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-1 font-semibold text-slate-700 transition-all hover:bg-slate-200"
        >
          <RotateCcw size={16} />
          Xóa bộ lọc
        </button>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-1 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-700"
        >
          <Plus size={18} />
          Thêm Booking Mới
        </button>
      </div>
    </div>
  );
};

export default BookingFilters;
