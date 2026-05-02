import React, { useEffect, useState } from "react";
import { Calendar, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "../../api/articles/articleApi";
import apiClient from "../../api/client";
import ActivityHero from "../../components/activities/ActivityHero";

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [articleData, attractionRes] = await Promise.all([
          getArticles({ scope: "public" }),
          apiClient.get("/Attractions/public", { params: { pageSize: 100 } }),
        ]);
        setArticles(articleData);
        setAttractions(attractionRes.data?.items ?? attractionRes.data ?? []);
      } catch (err) {
        console.error("Failed to load blog and attractions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section from ActivityPage */}
      <ActivityHero />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-12 pb-20 relative z-10">
        
        {loading ? (
          <div className="mt-16 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]"></div>
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* Top Activities Section */}
            {articles.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Các hoạt động hàng đầu</h2>
                  <Link to="/articles/search" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#01539d] hover:underline">
                    Xem tất cả <ArrowRight className="size-4" />
                  </Link>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {articles.slice(0, 8).map((item) => (
                    <Link
                      key={`article-${item.id}`}
                      to={`/articles/${item.slug || item.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-md">
                          {item.categoryName || "Hoạt động"}
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="text-base font-black leading-snug text-slate-900 group-hover:text-[#01539d] transition-colors line-clamp-2 mb-2">
                          {item.title}
                        </h2>
                        
                        <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-4 flex-1">
                          {item.summary || "Trải nghiệm đáng nhớ đang chờ đón bạn."}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                           <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                             <span className="flex items-center gap-1">
                               <Calendar className="size-3" />
                               {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                             </span>
                           </div>
                          <span className="flex items-center gap-1 text-sm font-bold text-[#01539d]">
                            Chi tiết
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Nearby Attractions Section */}
            {attractions.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Khám phá các địa điểm xung quanh</h2>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {attractions.slice(0, 8).map((item) => (
                    <div
                      key={`attraction-${item.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={item.imageUrl || "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                        
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h2 className="text-lg font-black leading-snug drop-shadow-md line-clamp-1 mb-1">
                            {item.name}
                          </h2>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90">
                            <MapPin className="size-3 text-rose-400" />
                            <span className="line-clamp-1">{item.address || "Việt Nam"}</span>
                          </div>
                        </div>

                        <div className="absolute top-3 left-3 rounded-lg bg-rose-500/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
                          {item.category || "Địa điểm"}
                        </div>
                      </div>
                      
                      <div className="flex flex-col p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                            {item.distanceKm ? `Cách ${item.distanceKm} km` : "Gần bạn"}
                          </span>
                          <span className="flex items-center gap-1 text-[13px] font-bold text-rose-600 group-hover:underline">
                            Xem thêm <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
