import React from "react";
import SearchSidebar from "../../components/blog-search/SearchSidebar";
import SearchResultCard from "../../components/blog-search/SearchResultCard";

const BlogSearchPage = () => {
  const searchKeyword = "Đà Lạt";
  const resultsCount = 12;

  const results = [
    {
      id: 1,
      category: "CẨM NANG",
      date: "22/03/2026",
      title: 'Top 10 địa điểm "sống ảo" không thể bỏ qua tại Đà Lạt',
      excerpt:
        "Khám phá những góc check-in mới toanh tại Đà Lạt từ quán cafe view rừng thông đến những vườn hoa rực rỡ...",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
    },
    {
      id: 2,
      category: "ẨM THỰ",
      date: "20/03/2026",
      title: "Ăn gì ở Đà Lạt? Cẩm nang ẩm thực từ sáng đến đêm",
      excerpt:
        "Bánh mì xíu mại, lẩu gà lá é, sữa đậu nành nóng... Hãy cùng chúng tôi khám phá thiên đường ẩm thực...",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
    },
    {
      id: 3,
      category: "KHUYẾN MÃI",
      date: "18/03/2026",
      title: "Ưu đãi đặt phòng sớm mùa lễ hội cuối năm tại Đà Lạt",
      excerpt:
        "Giảm ngay 30% khi đặt phòng trước 30 ngày. Tận hưởng không khí se lạnh của Đà Lạt cùng dịch vụ...",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Breadcrumbs */}
        <nav className="text-xs text-slate-400 mb-6 flex gap-2">
          <span>Trang chủ</span> <span>/</span> <span>Bài viết</span>{" "}
          <span>/</span> <span className="text-blue-500">Kết quả tìm kiếm</span>
        </nav>

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-800">
            Kết quả tìm kiếm cho:{" "}
            <span className="text-blue-500">'{searchKeyword}'</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tìm thấy {resultsCount} bài viết liên quan đến từ khóa của bạn.
          </p>
        </div>

        <div className="flex flex-col lg:row gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <SearchSidebar />

          {/* Results List */}
          <div className="flex-1">
            {results.map((post) => (
              <SearchResultCard key={post.id} post={post} />
            ))}

            {/* Pagination */}
            <div className="flex justify-center mt-12 gap-2">
              <button className="w-10 h-10 rounded-lg bg-blue-500 text-white font-bold text-sm">
                1
              </button>
              {[2, 3, "...", 8].map((n, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-white border border-slate-100 text-slate-400 font-bold text-sm hover:bg-blue-50 transition-all"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSearchPage;
