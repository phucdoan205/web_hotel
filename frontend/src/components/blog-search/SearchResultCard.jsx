import React from "react";
import { ChevronRight, Calendar, Tag as TagIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const SearchResultCard = ({ post }) => {
  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return (
    <Link 
      to={`/articles/${post.slug || post.id}`}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row group cursor-pointer"
    >
      {/* Image Section */}
      <div className="md:w-[280px] h-56 md:h-auto overflow-hidden relative flex-shrink-0">
        <img
          src={post.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          alt={post.title}
        />
        {post.categoryName && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold rounded-lg shadow-sm">
              {post.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-6 flex flex-col flex-1 min-w-0">
        <div className="flex flex-col h-full">
          {/* Header Info */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>{formattedDate}</span>
            </div>
            {post.attractionName && (
              <div className="flex items-center gap-1.5 text-sky-600">
                <MapPin className="size-3.5" />
                <span>{post.attractionName}</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow leading-relaxed">
            {post.summary || "Bấm vào để xem chi tiết bài viết này. Khám phá những thông tin hữu ích và thú vị dành cho bạn."}
          </p>

          {/* Footer Area with Tags and CTA */}
          <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
            <div className="flex flex-wrap gap-2 pr-4">
              {Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                  <TagIcon className="size-3" />
                  {tag}
                </span>
              ))}
              {Array.isArray(post.tags) && post.tags.length > 3 && (
                <span className="text-[11px] font-bold px-2 py-1 text-slate-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>

            <button className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 font-bold text-sm px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              Đọc tiếp
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchResultCard;
