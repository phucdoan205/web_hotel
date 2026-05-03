import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchSidebar from "../../components/blog-search/SearchSidebar";
import SearchResultCard from "../../components/blog-search/SearchResultCard";
import { getArticles } from "../../api/articles/articleApi";
import { Loader2 } from "lucide-react";

const BlogSearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("q") || "";
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await getArticles(searchKeyword ? { search: searchKeyword } : {});
        setArticles(data);
      } catch (err) {
        setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [searchKeyword]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedTags, sortBy, searchKeyword]);

  // Derived Data
  const availableCategories = useMemo(() => {
    const counts = {};
    articles.forEach(article => {
      const cat = article.categoryName || "Khác";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [articles]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    articles.forEach(article => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [articles]);

  // Filtering & Sorting
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (selectedCategories.length > 0) {
      result = result.filter(a => selectedCategories.includes(a.categoryName || "Khác"));
    }

    if (selectedTags.length > 0) {
      result = result.filter(a => 
        Array.isArray(a.tags) && selectedTags.some(t => a.tags.includes(t))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [articles, selectedCategories, selectedTags, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <nav className="text-sm font-medium text-slate-500 mb-2 flex gap-2">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Trang chủ</span> 
            <span>/</span> 
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Hoạt động</span>
            <span>/</span> 
            <span className="text-slate-800">Kết quả tìm kiếm</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-800">
            {searchKeyword ? (
              <>Tìm kiếm: <span className="text-blue-600">"{searchKeyword}"</span></>
            ) : "Tất cả bài viết"}
          </h1>
          {!loading && (
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Tìm thấy <span className="font-bold text-slate-700">{filteredArticles.length}</span> bài viết phù hợp.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 flex-shrink-0">
            <SearchSidebar 
              categories={availableCategories}
              tags={availableTags}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="size-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang tìm kiếm bài viết...</p>
              </div>
            ) : error ? (
              <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 text-center font-medium">
                {error}
              </div>
            ) : currentArticles.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedTags([]);
                    setSortBy("newest");
                  }}
                  className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {currentArticles.map((post) => (
                  <SearchResultCard key={post.id} post={post} />
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2 border-transparent"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSearchPage;

