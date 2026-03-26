import React from "react";
import { Search } from "lucide-react";

const GuestFilters = ({ search, setSearch, activeTab, setActiveTab }) => {
  const tabs = ["All Guests", "Regular", "VIP", "Blacklisted"];

  return (
    <div className="bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="relative w-full lg:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-[#0085FF] transition-colors" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, hoặc số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
        />
      </div>

      <div className="flex items-center bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white text-[#0085FF] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GuestFilters;
