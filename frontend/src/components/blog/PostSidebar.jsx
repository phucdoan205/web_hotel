import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { getArticles } from "../../api/articles/articleApi";

const PostSidebar = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getArticles({ scope: "public" });
        // Get top 5 latest articles
        setArticles(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to load sidebar articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Bài viết mới nhất */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm ring-1 ring-black/5">
        <h3 className="font-bold text-slate-800 mb-6">Bài viết mới nhất</h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
             <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0194f3]"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="flex flex-col gap-5">
              {articles.map((item) => (
                <Link to={`/articles/${item.slug || item.id}`} key={item.id} className="flex gap-4 group cursor-pointer">
                  <img
                    src={item.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100"}
                    className="w-16 h-16 rounded-xl object-cover"
                    alt={item.title}
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0194f3] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[10px] font-semibold text-slate-400">
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      {item.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={8} fill={s <= Math.round(item.averageRating) ? "#fbbf24" : "none"} className={s <= Math.round(item.averageRating) ? "text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                          <span className="text-[9px] font-black text-slate-600">{item.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 border-t border-slate-50 pt-4">
              <Link 
                to="/articles/search" 
                className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#0194f3] hover:underline"
              >
                Xem thêm bài viết <ArrowRight size={14} />
              </Link>
            </div>
          </>
        ) : (
           <p className="text-xs text-slate-500">Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
};

export default PostSidebar;
