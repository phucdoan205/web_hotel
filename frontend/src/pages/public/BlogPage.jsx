import React, { useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle, Search } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          User / Bài viết
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Bài viết</h1>
        <p className="mt-2 text-[13px] font-bold text-gray-400">
          Xem các bài viết đã duyệt ngay trong khu vực tài khoản của bạn.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm font-semibold text-gray-400">
          Đang tải bài viết...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-16 text-center text-sm font-semibold text-gray-400">
          Chưa có bài viết phù hợp.
        </div>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-2 2xl:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              to={`/articles/${article.slug || article.id}`}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={article.thumbnailUrl || "https://placehold.co/800x480/e2e8f0/64748b?text=News"}
                alt={article.title}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                    {article.categoryName || "Tin tức"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {article.authorName || "Hotel"}
                  </span>
                </div>
                <h2 className="text-xl font-black leading-tight text-slate-900">{article.title}</h2>
                <p className="line-clamp-3 text-sm font-medium text-slate-500">
                  {article.summary || "Xem chi tiết bài viết đã duyệt của khách sạn."}
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="size-4" />
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    {article.commentCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
