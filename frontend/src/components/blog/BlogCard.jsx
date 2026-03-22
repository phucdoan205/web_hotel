import React from "react";
import { Calendar, ChevronRight } from "lucide-react";

const BlogCard = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.image}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={post.title}
        />
        <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
          {post.category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-medium">
          <Calendar size={14} /> {post.date}
        </div>
        <h3 className="font-bold text-slate-800 mb-2 leading-tight h-12 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <button className="flex items-center gap-1 text-blue-500 font-bold text-sm hover:gap-2 transition-all">
          Đọc tiếp <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
