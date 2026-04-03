import React from "react";
import { Search, Calendar, ChevronDown, Filter } from "lucide-react";

const BookingFilters = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Guest or ID..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-sky-100 outline-none"
        />
      </div>

      {/* Selects Group */}
      <div className="flex flex-wrap items-center gap-3">
        {["All Status", "Oct 2023", "All Room Types"].map((text, idx) => (
          <button
            key={idx}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {idx === 1 && <Calendar className="size-4" />}
            {text}
            <ChevronDown className="size-4 text-gray-400" />
          </button>
        ))}

        <button className="p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100">
          <Filter className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default BookingFilters;
