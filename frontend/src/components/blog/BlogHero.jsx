import React from "react";
import { Search } from "lucide-react";

const BlogHero = () => {
  return (
    <div className="relative h-[300px] w-full flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Blog Banner"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Cẩm nang du lịch & Tin tức khách sạn
        </h1>
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Tìm bài viết, địa điểm..."
            className="w-full py-4 px-6 pr-16 rounded-full text-slate-800 outline-none shadow-xl"
          />
          <button className="absolute right-2 top-2 bg-blue-500 p-2.5 rounded-full hover:bg-blue-600 transition-colors">
            <Search className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogHero;
