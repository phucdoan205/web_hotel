import React from "react";

const BookingSidebarFilter = ({ filters, onChange, onClear, availableAmenities = [], isAmenitiesLoading = false }) => {
  const { maxPrice, amenities, minRating } = filters;

  const handleCheckboxChange = (field, value, checked) => {
    const currentList = filters[field];
    if (checked) {
      onChange(field, [...currentList, value]);
    } else {
      onChange(field, currentList.filter(item => item !== value));
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Bộ lọc tìm kiếm</h3>
        <button 
          onClick={onClear}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-6">
        {/* Khoảng giá */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-4 text-sm font-bold text-slate-900">Khoảng giá / đêm</h4>
          <div className="text-center text-sm font-semibold text-blue-600">
            200.000đ - {new Intl.NumberFormat("vi-VN").format(maxPrice)}đ
          </div>
          <input 
            type="range" 
            min="200000" 
            max="100000000" 
            step="500000"
            value={maxPrice}
            onChange={(e) => onChange("maxPrice", Number(e.target.value))}
            className="mt-4 w-full accent-blue-600" 
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
            <span>200k</span>
            <span>50tr</span>
            <span>100tr</span>
          </div>
        </div>

        {/* Tiện nghi */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-4 text-sm font-bold text-slate-900">Tiện nghi</h4>
          <div className="space-y-3">
            {isAmenitiesLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="size-3 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                Đang tải tiện nghi...
              </div>
            ) : availableAmenities.length > 0 ? (
              availableAmenities.map((item, idx) => (
                <label key={idx} className="flex cursor-pointer items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={amenities.includes(item)}
                    onChange={(e) => handleCheckboxChange("amenities", item, e.target.checked)}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" 
                  />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Không tìm thấy tiện nghi nào.</p>
            )}
          </div>
        </div>

        {/* Đánh giá khách */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="mb-4 text-sm font-bold text-slate-900">Đánh giá khách</h4>
          <div className="space-y-3">
            {[
              { label: "Tất cả", value: 0 },
              { label: "5 sao trở lên", value: 5 },
              { label: "4 sao trở lên", value: 4 },
              { label: "3 sao trở lên", value: 3 },
            ].map((item, idx) => (
              <label key={idx} className="flex cursor-pointer items-center gap-3">
                <input 
                  type="radio" 
                  name="ratingFilter"
                  checked={minRating === item.value}
                  onChange={() => onChange("minRating", item.value)}
                  className="size-4 border-slate-300 text-blue-600 focus:ring-blue-600" 
                />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingSidebarFilter;
