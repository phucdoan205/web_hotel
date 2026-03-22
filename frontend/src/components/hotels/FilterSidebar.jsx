import React from "react";

const FilterSection = ({ title, children }) => (
  <div className="mb-6 border-b pb-6 last:border-0">
    <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
    {children}
  </div>
);

const FilterSidebar = () => {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm h-fit sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg">Bộ lọc</h2>
        <button className="text-blue-500 text-sm font-bold">ĐẶT LẠI</button>
      </div>

      <FilterSection title="Phạm vi giá (1 đêm)">
        <input
          type="range"
          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
          min="0"
          max="10000000"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0 VND</span>
          <span>10.000.000 VND</span>
        </div>
      </FilterSection>

      <FilterSection title="Hạng sao">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="border rounded-md py-1 text-sm hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              {star} ★
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Tiện nghi">
        {["Wi-Fi Miễn Phí", "Hồ bơi", "Chỗ đậu xe", "Trung tâm thể hình"].map(
          (item) => (
            <label
              key={item}
              className="flex items-center gap-3 mb-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-blue-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">
                {item}
              </span>
            </label>
          ),
        )}
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;
