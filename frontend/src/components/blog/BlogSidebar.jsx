import React from "react";

const BlogSidebar = () => {
  const topPosts = [
    {
      title: "Lịch trình 3 ngày 2 đêm tại Phú Quốc cho cặp đôi",
      date: "20/03/2026",
    },
    { title: "Kinh nghiệm săn vé máy bay giá rẻ từ A-Z", date: "18/03/2026" },
    {
      title: "Phượt xuyên Việt bằng tàu hỏa cần chuẩn bị gì?",
      date: "15/03/2026",
    },
  ];

  const tags = [
    "#TravelGuide",
    "#HotelReview",
    "#Foodie",
    "#Staycation",
    "#Bali",
    "#Danang",
    "#Promotion",
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Xem nhiều nhất */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-500 rounded-full"></span> Xem nhiều
          nhất
        </h3>
        <div className="flex flex-col gap-5">
          {topPosts.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <h4 className="text-sm font-semibold text-slate-700 group-hover:text-blue-500 transition-colors line-clamp-2 mb-1">
                {post.title}
              </h4>
              <span className="text-[10px] text-slate-400">{post.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tag phổ biến */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Thẻ phổ biến</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-500 cursor-pointer transition-colors border border-slate-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;
