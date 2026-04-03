import React from "react";

const RoomFilters = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: "all", label: "Tất cả (120)", color: "bg-[#0085FF] text-white" },
    {
      id: "clean",
      label: "Sạch (68)",
      color: "bg-emerald-50 text-emerald-500 border border-emerald-100",
    },
    {
      id: "dirty",
      label: "Bẩn (45)",
      color: "bg-rose-50 text-rose-500 border border-rose-100",
    },
    {
      id: "cleaning",
      label: "Đang dọn (12)",
      color: "bg-orange-50 text-orange-500 border border-orange-100",
    },
    {
      id: "maintenance",
      label: "Bảo trì (5)",
      color: "bg-pink-50 text-pink-500 border border-pink-100",
    },
  ];

  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => setActiveFilter(f.id)}
          className={`px-6 py-2 rounded-full text-[11px] font-black transition-all whitespace-nowrap ${
            activeFilter === f.id
              ? f.color
              : "bg-white text-gray-400 hover:bg-gray-50"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default RoomFilters;
