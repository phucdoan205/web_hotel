import React from "react";

// Component con cho từng nhóm checklist
const ChecklistGroup = ({ title, items, badge }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4 bg-gray-50/50 p-3 rounded-xl">
      <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">
        {title}
      </h3>
      <span className="text-[10px] font-black text-gray-400 bg-white px-3 py-1 rounded-lg border border-gray-100">
        {badge}
      </span>
    </div>
    <div className="space-y-4 px-2">
      {items.map((item, idx) => (
        <label
          key={idx}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <input
            type="checkbox"
            className="size-5 rounded-md border-gray-200 text-[#0085FF] focus:ring-[#0085FF]"
          />
          <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
            {item}
          </span>
        </label>
      ))}
    </div>
  </div>
);

const InspectionHeader = ({ roomData }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-start mb-6">
    <div>
      <p className="text-[10px] font-black text-[#0085FF] uppercase mb-1">
        Mã phòng: {roomData.code}
      </p>
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-4">
        Phòng {roomData.id} – {roomData.type}
        <button className="text-[10px] bg-blue-50 text-[#0085FF] px-4 py-1 rounded-full border border-blue-100 italic">
          🔗 Đổi phòng
        </button>
      </h1>
      <p className="text-xs font-black text-orange-500 mt-2 uppercase tracking-tighter">
        ● {roomData.status}
      </p>

      <div className="grid grid-cols-4 gap-12 mt-8">
        {[
          { label: "Nhân viên phụ trách", value: roomData.staff },
          { label: "Thời gian bắt đầu", value: roomData.startTime },
          { label: "Số khách vừa đi", value: roomData.guests },
          { label: "Dự kiến hoàn thành", value: roomData.endTime },
        ].map((info, i) => (
          <div key={i}>
            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
              {info.label}
            </p>
            <p className="text-xs font-black text-gray-900">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
    <img
      src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=300"
      className="w-64 h-40 object-cover rounded-[2rem] shadow-inner"
      alt="Room preview"
    />
  </div>
);

export { InspectionHeader, ChecklistGroup };
