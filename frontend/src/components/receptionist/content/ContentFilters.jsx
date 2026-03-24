import React from "react";
import { Search, ListFilter, ArrowUpDown, Plus } from "lucide-react";

const ContentFilters = ({ activeTab, onAdd }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder={
            activeTab === "posts"
              ? "Tìm kiếm bài viết..."
              : "Tìm kiếm danh mục..."
          }
          className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs w-96 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
          <ListFilter size={14} className="text-gray-400" /> Bộ lọc
        </button>
        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
          <ArrowUpDown size={14} className="text-gray-400" /> Sắp xếp
        </button>
        <button className="ml-2 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          <Plus size={16} strokeWidth={3} />{" "}
          {activeTab === "posts" ? "Thêm bài viết mới" : "Thêm danh mục mới"}
        </button>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
      >
        <Plus size={16} strokeWidth={3} />
        {activeTab === "posts" ? "Thêm bài viết mới" : "Thêm danh mục mới"}
      </button>
    </div>
  );
};

export default ContentFilters;
