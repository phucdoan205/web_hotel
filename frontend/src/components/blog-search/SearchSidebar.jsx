import React from "react";
import { Check, Clock, CalendarDays } from "lucide-react";

const FilterSection = ({ title, children }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-5">
    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
      <span className="w-1 h-4 bg-blue-600 rounded-full"></span> {title}
    </h3>
    {children}
  </div>
);

const SearchSidebar = ({
  categories,
  tags,
  selectedCategories,
  setSelectedCategories,
  selectedTags,
  setSelectedTags,
  sortBy,
  setSortBy
}) => {
  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full">
      <FilterSection title="Sắp xếp theo">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${sortBy === "newest" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
              {sortBy === "newest" && <Check className="size-3" />}
            </div>
            <input
              type="radio"
              name="sortBy"
              checked={sortBy === "newest"}
              onChange={() => setSortBy("newest")}
              className="hidden"
            />
            <span className={`text-sm font-medium ${sortBy === "newest" ? "text-slate-800" : "text-slate-600"}`}>Mới nhất</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${sortBy === "oldest" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
              {sortBy === "oldest" && <Check className="size-3" />}
            </div>
            <input
              type="radio"
              name="sortBy"
              checked={sortBy === "oldest"}
              onChange={() => setSortBy("oldest")}
              className="hidden"
            />
            <span className={`text-sm font-medium ${sortBy === "oldest" ? "text-slate-800" : "text-slate-600"}`}>Cũ nhất</span>
          </label>
        </div>
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection title="Chuyên mục">
          <div className="flex flex-col gap-2">
            {categories.map((item, i) => {
              const isChecked = selectedCategories.includes(item.label);
              return (
                <label
                  key={i}
                  className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-5 h-5 rounded border ${isChecked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                      {isChecked && <Check className="size-3.5" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(item.label)}
                      className="hidden"
                    />
                    <span className={`text-sm font-medium ${isChecked ? "text-slate-800" : "text-slate-600"}`}>{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                    {item.count}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {tags.length > 0 && (
        <FilterSection title="Thẻ (Tags)">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    isSelected 
                      ? "bg-blue-50 border-blue-200 text-blue-600" 
                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-500 hover:bg-slate-50"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );
};

export default SearchSidebar;
