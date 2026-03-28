import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ShiftCard = ({ title, time, staff }) => (
  <div className="flex-1 bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
    <div className="mb-4">
      <h4 className="text-[11px] font-black text-gray-900 uppercase">
        {title}
      </h4>
      <p className="text-[10px] font-bold text-gray-400 tracking-tighter">
        {time}
      </p>
    </div>
    <div className="space-y-3">
      {staff.map((person, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
        >
          <p className="text-xs font-black text-gray-900">{person.name}</p>
          <p className="text-[9px] font-bold text-[#0085FF] uppercase mt-1">
            {person.area}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const ShiftSchedule = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-sm font-black text-gray-900 uppercase">
        Ca làm việc hôm nay – Tầng 1–5
      </h3>
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
        <button className="text-gray-400 hover:text-gray-900">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[11px] font-black text-gray-900">24/05/2024</span>
        <button className="text-gray-400 hover:text-gray-900">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
    <div className="flex gap-6">
      <ShiftCard
        title="Ca Sáng"
        time="(06:00 - 14:00)"
        staff={[
          { name: "Nguyễn Văn A (Lead)", area: "Phụ trách: Tầng 1, 2" },
          { name: "Trần Thị B", area: "Phụ trách: Tầng 3" },
        ]}
      />
      <ShiftCard
        title="Ca Chiều"
        time="(14:00 - 22:00)"
        staff={[
          { name: "Lê Văn C", area: "Phụ trách: Tầng 4, 5" },
          { name: "Phạm Minh D", area: "Phụ trách: Khu vực sảnh" },
        ]}
      />
      <ShiftCard
        title="Ca Tối"
        time="(22:00 - 06:00)"
        staff={[{ name: "Hoàng Anh E", area: "Phụ trách: Trực đêm" }]}
      />
    </div>
  </div>
);

export default ShiftSchedule;
