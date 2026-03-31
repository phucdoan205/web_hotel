import React from "react";

const FilterSection = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
      <span className="w-1 h-4 bg-blue-500 rounded-full"></span> {title}
    </h3>
    {children}
  </div>
);

const SearchSidebar = () => {
  return (
    <div className="w-full lg:w-80">
      <FilterSection title="Chuyên mục">
        <div className="flex flex-col gap-3">
          {[
            { label: "Cẩm nang du lịch", count: 12, checked: true },
            { label: "Ẩm thực", count: 4 },
            { label: "Khuyến mãi", count: 3 },
          ].map((item, i) => (
            <label
              key={i}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-blue-500 transition-colors">
                <input
                  type="checkbox"
                  checked={item.checked}
                  className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                {item.label}
              </div>
              <span className="text-xs text-slate-400">({item.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Thời gian">
        <div className="flex flex-col gap-3 text-sm text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="time"
              className="text-blue-500"
              defaultChecked
            />{" "}
            Mới nhất
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="time" className="text-blue-500" /> Cũ nhất
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Thẻ phổ biến">
        <div className="flex flex-wrap gap-2">
          {["#Dalat", "#Food", "#Promotion", "#Review"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default SearchSidebar;
