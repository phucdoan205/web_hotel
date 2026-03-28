import React from "react";
import { ChevronDown, Filter } from "lucide-react";

const TaskFilters = () => {
  const filterStyles =
    "flex items-center gap-2 bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-all";

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button className={filterStyles}>
          🏢 Tất cả tầng <ChevronDown size={14} />
        </button>
        <button className={filterStyles}>
          🔄 Trạng thái: Đang dọn <ChevronDown size={14} />
        </button>
        <button className={filterStyles}>
          ⚡ Ưu tiên: Khẩn cấp <ChevronDown size={14} />
        </button>
        <button className="text-[11px] font-black text-[#0085FF] ml-4 hover:underline">
          Đặt lại bộ lọc
        </button>
      </div>

      <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-gray-800 transition-all">
        📥 Xuất báo cáo (Excel)
      </button>
    </div>
  );
};

export default TaskFilters;
