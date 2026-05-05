import React from "react";
import { Star } from "lucide-react";

const ServiceSidebar = ({ filters, onFilterChange }) => {
  const sortOptions = [
    { value: "popular", label: "Được ưa chuộng" },
    { value: "price_asc", label: "Giá thấp nhất trước" },
    { value: "price_desc", label: "Giá cao nhất trước" },
    { value: "rating_desc", label: "Xếp hạng cao nhất trước" },
  ];

  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      {/* Sorting */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Sắp xếp</h3>
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={filters.sort === option.value}
                onChange={() => onFilterChange({ sort: option.value })}
                className="size-4 cursor-pointer accent-[#0194f3]"
              />
              <span className={`text-sm font-bold ${filters.sort === option.value ? "text-[#0194f3]" : "text-slate-600"}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Ratings */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Đánh giá sao</h3>
        <div className="space-y-3">
          {stars.map((star) => (
            <label key={star} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.minStars === star}
                onChange={() => onFilterChange({ minStars: filters.minStars === star ? null : star })}
                className="size-4 cursor-pointer rounded accent-[#0194f3]"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < star ? "#fbbf24" : "none"}
                    className={i < star ? "text-amber-400" : "text-slate-200"}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">
                 {star === 5 ? "" : "trở lên"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;
