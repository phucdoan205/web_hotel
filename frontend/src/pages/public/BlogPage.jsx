import React, { useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import apiClient from "../../api/client";
import { getArticles } from "../../api/articles/articleApi";

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [articleData, categoryResponse] = await Promise.all([
          getArticles({ scope: "public" }),
          apiClient.get("/ArticleCategories"),
        ]);

        setArticles(articleData);
        setCategories(categoryResponse.data ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "all" || String(article.categoryId) === activeCategory;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        [article.title, article.summary, article.authorName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, articles, search]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_50%),linear-gradient(135deg,_#0f172a,_#1e3a8a)] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-200">
            Hotel News
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Bài viết.
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium text-slate-200">
            Theo dõi tin tức khách sạn, ưu đãi, hướng dẫn và trao đổi dưới từng bài viết.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm bài viết..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-2xl px-4 py-3 text-sm font-bold ${activeCategory === "all" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setActiveCategory(String(category.id))}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${activeCategory === String(category.id) ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-400">
            Đang tải bài viết...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-400">
            Chưa có bài viết được duyệt.
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.slug || article.id}`}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={article.thumbnailUrl || "https://placehold.co/800x480/e2e8f0/64748b?text=News"}
                  alt={article.title}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-600">
                      {article.categoryName || "Tin tức"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {article.authorName || "Hotel"}
                    </span>
                  </div>
                  <h2 className="text-xl font-black leading-tight text-slate-900">
                    {article.title}
                  </h2>
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
    </div>
  );
};

export default BlogPage;
