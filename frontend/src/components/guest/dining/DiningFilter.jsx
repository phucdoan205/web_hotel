import React, { useState } from "react";

const DiningFilter = () => {
  const categories = [
    "All Items",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Drinks",
    "Desserts",
  ];
  const [active, setActive] = useState("All Items");

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-6 py-2.5 rounded-full text-[11px] font-black transition-all whitespace-nowrap ${
            active === cat
              ? "bg-[#0085FF] text-white shadow-lg shadow-blue-100"
              : "bg-white text-gray-400 border border-gray-100 hover:border-blue-200 hover:text-gray-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default DiningFilter;
