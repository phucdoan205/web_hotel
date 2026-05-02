import React, { useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "../../api/articles/articleApi";

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const articleData = await getArticles({ scope: "public" });
        setArticles(articleData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return articles.filter((article) => {
      if (!keyword) return true;
      return [article.title, article.summary, article.authorName, article.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword));
    });
  }, [articles, search]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-[#01539d] pt-16 pb-32 text-center text-white relative">
        <h1 className="text-4xl font-black md:text-5xl tracking-tight">Góc Khám Phá</h1>
        <p className="mt-4 text-lg font-medium text-white/80 max-w-2xl mx-auto px-4">
          Cập nhật những thông tin mới nhất, cẩm nang du lịch và những ưu đãi hấp dẫn từ hệ thống khách sạn của chúng tôi.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 -mt-16 relative z-10 pb-20">
        {/* Search Bar */}
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-3 shadow-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-6 size-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm bài viết, chủ đề, điểm đến..."
              className="w-full rounded-full bg-transparent py-4 pl-14 pr-6 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button className="hidden md:block absolute right-2 rounded-full bg-[#0194f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#017bc0]">
              Tìm kiếm
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-16 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]"></div>
            Đang tải bài viết...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="mt-16 rounded-[2rem] border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy bài viết</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Chưa có bài viết nào phù hợp với từ khóa tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.slug || article.id}`}
                className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-md transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={article.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0194f3] backdrop-blur">
                    {article.categoryName || "Tin tức"}
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-4" />
                      {article.commentCount}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-black leading-snug text-slate-900 group-hover:text-[#0194f3] transition-colors line-clamp-2 mb-3">
                    {article.title}
                  </h2>
                  
                  <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                    {article.summary || "Xem chi tiết bài viết để biết thêm thông tin về chủ đề này. Các bài viết luôn được cập nhật thường xuyên."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-1 text-sm font-bold text-[#0194f3]">
                      Đọc tiếp <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
