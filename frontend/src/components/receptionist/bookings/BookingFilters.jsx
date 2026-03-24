import React from "react";
import { Search, Calendar, CheckCircle2, Bed, Plus } from "lucide-react";

const BookingFilters = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Guest Name or Room..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs w-80 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
          <Calendar size={14} className="text-blue-500" /> Stay Date
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
          <CheckCircle2 size={14} className="text-blue-500" /> Booking Status
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
          <Bed size={14} className="text-blue-500" /> Room Type
        </button>
      </div>

      <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
        <Plus size={16} strokeWidth={3} /> Add New Booking
      </button>
    </div>
  );
};

export default BookingFilters;
