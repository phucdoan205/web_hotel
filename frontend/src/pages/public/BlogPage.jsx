import React, { useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle, Search, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "../../api/articles/articleApi";
import apiClient from "../../api/client";
import ActivityHero from "../../components/activities/ActivityHero";

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    
    let combined = [];

    if (activeTab === "all" || activeTab === "activities") {
      const filteredArticles = articles.filter((a) => {
        if (!keyword) return true;
        return [a.title, a.summary, a.authorName, a.categoryName]
          .filter(Boolean)
          .some((val) => val.toLowerCase().includes(keyword));
      }).map(a => ({ ...a, type: 'article' }));
      combined = [...combined, ...filteredArticles];
    }

    if (activeTab === "all" || activeTab === "locations") {
      const filteredAttractions = attractions.filter((a) => {
        if (!keyword) return true;
        return [a.name, a.category, a.address]
          .filter(Boolean)
          .some((val) => val.toLowerCase().includes(keyword));
      }).map(a => ({ ...a, type: 'attraction' }));
      combined = [...combined, ...filteredAttractions];
    }

    // Sort to mix them slightly or keep recent articles first
    if (activeTab === "all") {
      return combined.sort((a, b) => {
         const timeA = a.type === 'article' ? new Date(a.publishedAt || a.createdAt).getTime() : 0;
         const timeB = b.type === 'article' ? new Date(b.publishedAt || b.createdAt).getTime() : 0;
         // Push articles up if they have time, but we just randomly mix them for a better "explore" feed.
         // Wait, sorting by time means attractions go to the bottom (time=0). Let's just alternate them.
         return timeB - timeA;
      });
    }

    return combined;
  }, [articles, attractions, search, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section from ActivityPage */}
      <ActivityHero />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-12 pb-20">
        
        {/* Search Bar & Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          
          {/* Tabs */}
          <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeTab === "all" ? "bg-[#0194f3] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeTab === "activities" ? "bg-[#0194f3] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeTab === "locations" ? "bg-[#0194f3] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Địa điểm
            </button>
          </div>

          {/* Simple Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-6 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0194f3] focus:ring-1 focus:ring-[#0194f3]"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-16 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0194f3]"></div>
            Đang tải dữ liệu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-16 rounded-[2rem] border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy kết quả</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              if (item.type === 'article') {
                return (
                  <Link
                    key={`article-${item.id}`}
                    to={`/articles/${item.slug || item.id}`}
                    className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-md transition-all hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <img
                        src={item.thumbnailUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0194f3] backdrop-blur">
                        {item.categoryName || "Tin tức"}
                      </div>
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          {new Date(item.publishedAt || item.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="size-4" />
                          {item.commentCount}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-black leading-snug text-slate-900 group-hover:text-[#0194f3] transition-colors line-clamp-2 mb-3">
                        {item.title}
                      </h2>
                      
                      <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                        {item.summary || "Xem chi tiết bài viết để biết thêm thông tin về chủ đề này."}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1 text-sm font-bold text-[#0194f3]">
                          Đọc tiếp <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <div
                    key={`attraction-${item.id}`}
                    className="group flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-md transition-all hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wide text-rose-500 backdrop-blur">
                        {item.category || "Địa điểm"}
                      </div>
                    </div>
                    
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                        <MapPin className="size-4 text-rose-500" />
                        <span className="line-clamp-1">{item.address || "Việt Nam"}</span>
                      </div>
                      
                      <h2 className="text-xl font-black leading-snug text-slate-900 group-hover:text-rose-500 transition-colors line-clamp-2 mb-3">
                        {item.name}
                      </h2>
                      
                      <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                        {item.description || "Khám phá địa điểm thú vị này cho chuyến du lịch tiếp theo của bạn."}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-bold text-slate-900">
                          {item.distanceKm ? `Cách ${item.distanceKm} km` : "Vị trí đẹp"}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-bold text-rose-500 cursor-pointer">
                          Khám phá <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
