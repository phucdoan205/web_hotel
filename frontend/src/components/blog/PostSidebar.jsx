import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../../api/articles/articleApi";

const PostSidebar = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getArticles({ scope: "public" });
        // Get top 4 latest articles
        setArticles(data.slice(0, 4));
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
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
           <p className="text-xs text-slate-500">Chưa có bài viết nào.</p>
        )}
      </div>

    </div>
  );
};

export default PostSidebar;
