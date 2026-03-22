import React from "react";
import { Search, Calendar, Users } from "lucide-react";

const SearchSummary = () => (
  <div className="bg-slate-100 py-3 px-10 border-b flex items-center justify-between">
    <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-lg shadow-sm border w-full max-w-3xl">
      <div className="flex items-center gap-2 text-sm font-medium border-r pr-4">
        <Search size={16} className="text-blue-500" />
        <span>Đà Nẵng, Việt Nam</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium border-r pr-4">
        <Calendar size={16} className="text-blue-500" />
        <span>12 thg 10 - 13 thg 10</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users size={16} className="text-blue-500" />
        <span>2 khách, 1 phòng</span>
      </div>
    </div>
    <button className="text-blue-500 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-lg">
      Thay đổi tìm kiếm
    </button>
  </div>
);

export default SearchSummary;
