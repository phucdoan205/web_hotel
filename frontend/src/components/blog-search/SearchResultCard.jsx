import React from "react";
import { ChevronRight } from "lucide-react";

const SearchResultCard = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row mb-6 group cursor-pointer">
      {/* Image Section */}
      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
        <img
          src={post.image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={post.title}
        />
      </div>

      {/* Content Section */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              post.category === "CẨM NANG"
                ? "bg-blue-50 text-blue-600"
                : post.category === "ẨM THỰ"
                  ? "bg-orange-50 text-orange-600"
                  : "bg-green-50 text-green-600"
            }`}
          >
            {post.category}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {post.date}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-500 transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">
          {post.excerpt}
        </p>

        <button className="flex items-center gap-1 text-blue-500 font-bold text-sm hover:gap-2 transition-all">
          Đọc tiếp <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SearchResultCard;
