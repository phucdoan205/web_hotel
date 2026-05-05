import React, { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import publicServicesApi from "../../api/public/publicServicesApi";
import ServiceCard from "../../components/public/ServiceCard";
import ServiceSidebar from "../../components/public/ServiceSidebar";
import ServiceCategories from "../../components/public/ServiceCategories";

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const filters = {
    categoryId: searchParams.get("category") ? parseInt(searchParams.get("category")) : null,
    sort: searchParams.get("sort") || "popular",
    minStars: searchParams.get("stars") ? parseInt(searchParams.get("stars")) : null,
    page: parseInt(searchParams.get("page")) || 1,
    search: searchParams.get("search") || "",
  };

  const loadCategories = async () => {
    try {
      const data = await publicServicesApi.getPublicCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicServicesApi.getPublicServices({
        categoryId: filters.categoryId,
        sort: filters.sort,
        minStars: filters.minStars,
        page: filters.page,
        search: filters.search,
        pageSize: 16,
      });
      setServices(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId, filters.sort, filters.minStars, filters.page, filters.search]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const updateFilters = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    
    if (newFilters.categoryId !== undefined) {
      if (newFilters.categoryId) nextParams.set("category", newFilters.categoryId);
      else nextParams.delete("category");
      nextParams.set("page", 1);
    }
    
    if (newFilters.sort) {
      nextParams.set("sort", newFilters.sort);
      nextParams.set("page", 1);
    }
    
    if (newFilters.minStars !== undefined) {
      if (newFilters.minStars) nextParams.set("stars", newFilters.minStars);
      else nextParams.delete("stars");
      nextParams.set("page", 1);
    }
    
    if (newFilters.page) {
      nextParams.set("page", newFilters.page);
    }
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) nextParams.set("search", newFilters.search);
      else nextParams.delete("search");
      nextParams.set("page", 1);
    }

    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchValue });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20 pt-24">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        {/* Search Bar Section */}
        <div className="mb-10 flex flex-col items-center">
          <form 
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-2xl overflow-hidden rounded-full bg-white shadow-xl ring-1 ring-slate-100"
          >
            <Search className="absolute left-6 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Bạn muốn tìm dịch vụ gì?"
              className="h-14 w-full pl-14 pr-32 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 h-10 rounded-full bg-[#0194f3] px-6 text-sm font-black text-white transition-all hover:bg-[#017bc0] shadow-md"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Categories Grid/Row */}
          <div className="mt-12 w-full">
            <ServiceCategories
              categories={categories}
              selectedCategoryId={filters.categoryId}
              onCategorySelect={(id) => updateFilters({ categoryId: id })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Filter */}
          <div className="hidden lg:block">
            <ServiceSidebar
              filters={filters}
              onFilterChange={updateFilters}
            />
          </div>

          {/* Main Content - Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                <Loader2 className="size-10 animate-spin text-[#0194f3]" />
                <p className="mt-4 text-sm font-bold text-slate-500">Đang tìm dịch vụ tốt nhất cho bạn...</p>
              </div>
            ) : services.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-6">
                    <button
                      onClick={() => updateFilters({ page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="text-sm font-black text-slate-700">
                      Trang <span className="text-[#0194f3]">{filters.page}</span> trên <span className="text-slate-900">{totalPages}</span>
                    </div>

                    <button
                      onClick={() => updateFilters({ page: filters.page + 1 })}
                      disabled={filters.page === totalPages}
                      className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 p-10 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50">
                   <LayoutGrid className="size-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Không tìm thấy dịch vụ nào</h3>
                <p className="mt-2 text-sm font-bold text-slate-500 max-w-xs">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
                </p>
                <button
                  onClick={() => updateFilters({ categoryId: null, search: "", stars: null, sort: "popular" })}
                  className="mt-6 font-black text-[#0194f3] hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
