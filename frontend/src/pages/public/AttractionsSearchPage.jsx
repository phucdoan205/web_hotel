import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, MapPin, ArrowRight, Search, Map } from "lucide-react";
import apiClient from "../../api/client";

const AttractionsSearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get("q") || "";
  
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("distance"); // "distance", "name_asc"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Maybe 8 items since it's a grid

  useEffect(() => {
    const fetchAttractions = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/Attractions/public", { 
          params: { 
            pageSize: 100, // Get all active for client-side filtering/sorting
            search: searchKeyword || undefined
          } 
        });
        setAttractions(response.data?.items ?? response.data ?? []);
      } catch (err) {
        setError("Không thể tải danh sách địa điểm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttractions();
  }, [searchKeyword]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, sortBy, searchKeyword]);

  // Derived Data
  const availableCategories = useMemo(() => {
    const counts = {};
    attractions.forEach(attraction => {
      const cat = attraction.category || "Khác";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [attractions]);

  // Filtering & Sorting
  const filteredAttractions = useMemo(() => {
    let result = [...attractions];

    if (selectedCategories.length > 0) {
      result = result.filter(a => selectedCategories.includes(a.category || "Khác"));
    }

    result.sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // Default: distance
      const distA = a.distanceKm || 999;
      const distB = b.distanceKm || 999;
      return distA - distB;
    });

    return result;
  }, [attractions, selectedCategories, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAttractions.length / itemsPerPage);
  const currentAttractions = filteredAttractions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <nav className="text-sm font-medium text-slate-500 mb-2 flex gap-2">
            <Link to="/" className="hover:text-rose-600 cursor-pointer transition-colors">Trang chủ</Link> 
            <span>/</span> 
            <Link to="/activities" className="hover:text-rose-600 cursor-pointer transition-colors">Khám phá</Link>
            <span>/</span> 
            <span className="text-slate-800">Kết quả tìm kiếm</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-800">
            {searchKeyword ? (
              <>Tìm kiếm: <span className="text-rose-600">"{searchKeyword}"</span></>
            ) : "Tất cả địa điểm xung quanh"}
          </h1>
          {!loading && (
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Tìm thấy <span className="font-bold text-slate-700">{filteredAttractions.length}</span> địa điểm phù hợp.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 flex-shrink-0">
             {/* Simple Sidebar */}
             <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Map className="size-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-slate-800">Bộ lọc địa điểm</h3>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Danh mục</h4>
                  <div className="space-y-2">
                    {availableCategories.map(({ label, count }) => (
                      <label key={label} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(label)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories(prev => [...prev, label]);
                              } else {
                                setSelectedCategories(prev => prev.filter(c => c !== label));
                              }
                            }}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-rose-500 checked:border-rose-500 transition-colors cursor-pointer"
                          />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="flex-1 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                          {label}
                        </span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Sắp xếp theo</h4>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="distance">Khoảng cách (Gần nhất)</option>
                    <option value="name_asc">Tên (A-Z)</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="size-10 text-rose-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Đang tìm kiếm địa điểm...</p>
              </div>
            ) : error ? (
              <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 text-center font-medium">
                {error}
              </div>
            ) : currentAttractions.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="size-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy địa điểm</h3>
                <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setSortBy("distance");
                  }}
                  className="mt-6 px-6 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {currentAttractions.map((item) => (
                    <Link
                      to={`/attractions/${item.slug || item.id}`}
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
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                          currentPage === i + 1
                            ? "bg-rose-600 text-white ring-2 ring-rose-600 ring-offset-2 border-transparent"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-rose-600 hover:text-rose-600"
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

export default AttractionsSearchPage;
