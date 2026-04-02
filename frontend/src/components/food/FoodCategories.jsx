import React from "react";
import { Utensils, Globe, Star, Coffee, Cake, ChevronDown } from "lucide-react";

const CategoryTab = ({ icon, label, active }) => {
  const Icon = icon;
  return (
    <button
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
        active
          ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200"
          : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
};

const FoodCategories = () => {
  return (
    <div className="py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
        <button className="text-blue-500 font-bold text-sm hover:underline">
          View All →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        <CategoryTab icon={Utensils} label="Local Food" active />
        <CategoryTab icon={Globe} label="International" />
        <CategoryTab icon={Star} label="Fine Dining" />
        <CategoryTab icon={Coffee} label="Buffet" />
        <CategoryTab icon={Cake} label="Desserts" />
      </div>

      {/* Dropdown Filters */}
      <div className="flex gap-4 mt-6">
        {["Cuisine Type", "Price Range", "Dietary"].map((filter) => (
          <button
            key={filter}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            {filter} <ChevronDown size={14} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FoodCategories;
