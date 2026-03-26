import React, { useState } from "react";
import RoomFilters from "../../components/housekeeping/roomlist/RoomFilters";
import RoomStatsOverview from "../../components/housekeeping/roomlist/RoomStatsOverview";
import RoomTable from "../../components/housekeeping/roomlist/RoomTable";

const HousekeepingRoomListPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Danh sách phòng</h1>
          <div className="mt-4 relative group">
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
              className="bg-white border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
              🔍
            </div>
          </div>
        </div>
      </header>

      <RoomFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      <RoomStatsOverview />
      <RoomTable />
    </div>
  );
};

export default HousekeepingRoomListPage;
