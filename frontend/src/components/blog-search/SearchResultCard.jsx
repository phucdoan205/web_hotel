import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SearchResultCard = ({ post }) => {
  return (
    <Link 
      to={`/articles/${post.slug || post.id}`}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row mb-6 group cursor-pointer"
    >
      {/* Image Section */}
      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
        <img
          src={post.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={post.title}
        />
      </div>

      {/* Content Section */}
      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-600">
            {post.categoryName || "Góc khám phá"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-500 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">
          {post.summary || "Bấm vào để xem chi tiết bài viết này."}
        </p>

        <span className="flex items-center gap-1 text-blue-500 font-bold text-sm hover:gap-2 transition-all">
          Đọc tiếp <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
};

export default SearchResultCard;
