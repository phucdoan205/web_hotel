import React, { useState } from "react";

const FavoriteFilter = () => {
  const categories = ["All Stay", "Hotels", "Villas", "Apartments", "Resorts"];
  const [active, setActive] = useState("All Stay");

  return (
    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-6 py-2 rounded-full text-[11px] font-black transition-all whitespace-nowrap ${
            active === cat
              ? "bg-[#0085FF] text-white shadow-md shadow-blue-100"
              : "bg-white text-gray-400 border border-gray-100 hover:border-blue-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default FavoriteFilter;
