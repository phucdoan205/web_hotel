import React, { useRef, useState, useEffect } from "react";
import { ArrowRight, BadgePercent, BedDouble, Building2, ChevronLeft, ChevronRight, Heart, Home, Landmark, Palmtree, Search, Star } from "lucide-react";
import { isFavoriteRoomType, toggleFavoriteRoomType } from "../../utils/userFavorites";
import Hero from "../../components/home/Hero";
import FeaturedHotels from "../../components/home/FeaturedHotels";
import Destinations from "../../components/home/Destinations";
import Testimonials from "../../components/home/Testimonials";

import { useQuery } from "@tanstack/react-query";
import { roomTypesApi } from "../../api/admin/roomTypesApi";
import { getPublicAttractions } from "../../api/admin/attractionsApi";

const HomePage = () => {
  const carouselRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const { data: roomTypesData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["home-room-types"],
    queryFn: () => roomTypesApi.getPublicRoomTypes({ page: 1, pageSize: 100 }),
  });

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftBtn(scrollLeft > 10);
    setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [roomTypesData]);

  const handleScroll = (direction) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector("article");
    if (!card) return;
    const scrollAmount = card.clientWidth + 16;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const recentCarouselRef = useRef(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showRecentLeft, setShowRecentLeft] = useState(false);
  const [showRecentRight, setShowRecentRight] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(saved);
  }, []);

  const checkRecentScroll = () => {
    if (!recentCarouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = recentCarouselRef.current;
    setShowRecentLeft(scrollLeft > 10);
    setShowRecentRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = recentCarouselRef.current;
    if (el) {
      el.addEventListener("scroll", checkRecentScroll);
      checkRecentScroll();
    }
    return () => el?.removeEventListener("scroll", checkRecentScroll);
  }, [recentlyViewed]);

  const handleRecentScroll = (direction) => {
    if (!recentCarouselRef.current) return;
    const card = recentCarouselRef.current.querySelector("article");
    if (!card) return;
    const scrollAmount = card.clientWidth + 16;
    recentCarouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };




  const { data: attractionsData, isLoading: isLoadingAttractions } = useQuery({
    queryKey: ["home-attractions"],
    queryFn: () => getPublicAttractions({ page: 1, pageSize: 4 }),
  });



  const quickDeals = [
    "Đà Nẵng Luxury",
    "Phú Quốc Retreat",
    "Sapa Wellness",
    "Dalat Heritage",
    "Nha Trang Bay",
  ];
  return (
    <div className="bg-[#f8fafc]">
      <Hero />

      {/* Section: Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bạn vẫn quan tâm?</h2>
            </div>
            {recentlyViewed.length > 4 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleRecentScroll("left")}
                  disabled={!showRecentLeft}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => handleRecentScroll("right")}
                  disabled={!showRecentRight}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          
          <div className="relative group/recent">
            <div 
              ref={recentCarouselRef}
              className="no-scrollbar flex gap-4 overflow-x-auto pb-4 scroll-smooth"
            >
              {recentlyViewed.map((rt) => (
                <article 
                  key={rt.id} 
                  onClick={() => (window.location.href = `/room-types/${rt.id}`)}
                  className="min-w-[280px] w-[280px] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={rt.primaryImageUrl}
                      alt={rt.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute right-3 top-3">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toggleFavoriteRoomType({
                            roomTypeId: rt.id,
                            roomTypeName: rt.name,
                            basePrice: rt.basePrice,
                            imageUrls: [rt.primaryImageUrl]
                          }); 
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white"
                      >
                        <Heart size={20} className={isFavoriteRoomType(rt.id) ? 'text-red-500 fill-red-500' : 'text-slate-600'} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[12px] font-medium text-slate-500">Khách sạn</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < Math.round(rt.rating || 0) ? "#fbbf24" : "none"} 
                              className={i < Math.round(rt.rating || 0) ? "text-amber-400" : "text-slate-200"} 
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 leading-tight">{rt.name}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">Hệ thống HPT Hotel</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003b95] text-sm font-bold text-white">
                        {rt.rating > 0 ? Number(rt.rating).toFixed(1).replace('.', ',') : "0,0"}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[13px] font-bold text-slate-900 leading-none">
                          {rt.rating >= 4.5 ? "Tuyệt hảo" : rt.rating >= 4 ? "Rất tốt" : rt.rating > 0 ? "Tốt" : "Chưa có đánh giá"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{rt.reviewCount || 0} đánh giá</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Bắt đầu từ</p>
                      <p className="text-lg font-black text-slate-900">VND {new Intl.NumberFormat("vi-VN").format(rt.basePrice || 0)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section: Offers & Promo */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <BadgePercent size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Đặc quyền nghỉ dưỡng
                  </h2>
                  <p className="mt-2 max-w-md font-medium text-slate-500 leading-relaxed">
                    Khám phá những ưu đãi giới hạn dành riêng cho thành viên khi đặt phòng trực tiếp tại hệ thống HPT.
                  </p>
                </div>
              </div>
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1F649C] px-6 text-sm font-bold text-white transition hover:bg-[#164e7a] hover:shadow-lg active:scale-95">
                Xem ưu đãi ngay
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-100/30 blur-3xl" />
          </div>

          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 text-white shadow-xl">
            <div className="mb-4 inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              Dành cho bạn
            </div>
            <h3 className="text-2xl font-black leading-tight">
              Nâng tầm trải nghiệm <br /> với HPT Rewards
            </h3>
            <p className="mt-4 text-sm font-medium text-slate-400 leading-relaxed">
              Đăng nhập để nhận mức giá ưu đãi và tích lũy điểm thưởng cho mỗi kỳ nghỉ của bạn.
            </p>
            <button className="mt-6 w-full rounded-2xl bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100">
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </section>

      {/* Section: Property Types */}
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Lưu trú tại các chỗ nghỉ độc đáo hàng đầu</h2>
          <p className="mt-1 text-slate-500">
            Từ biệt thự, lâu đài cho đến nhà thuyền, igloo, chúng tôi đều có hết
          </p>
        </div>
        
        <div className="relative group/carousel">
          {/* Side Buttons */}
          {showLeftBtn && (
            <button 
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-[calc(50%-8px)] z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:bg-slate-50 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={24} className="text-slate-800" />
            </button>
          )}

          {showRightBtn && (
            <button 
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-[calc(50%-8px)] z-20 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:bg-slate-50 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={24} className="text-slate-800" />
            </button>
          )}




          <div 
            ref={carouselRef}
            id="property-carousel"
            className="no-scrollbar flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          >
            {roomTypesData?.items?.map((rt) => (
              <article 
                key={rt.id} 
                onClick={() => (window.location.href = `/room-types/${rt.id}`)}
                className="min-w-[calc((100%-48px)/1)] sm:min-w-[calc((100%-48px)/2)] lg:min-w-[calc((100%-48px)/4)] cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md"
              >

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={rt.primaryImageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"}
                    alt={rt.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-medium text-slate-500">Khách sạn</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.round(rt.rating || 0) ? "#fbbf24" : "none"} className={i < Math.round(rt.rating || 0) ? "text-amber-400" : "text-slate-300"} />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{rt.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Hệ thống HPT Hotel</p>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#003b95] text-sm font-bold text-white">
                      {rt.rating ? Number(rt.rating).toFixed(1) : "0.0"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {rt.rating >= 4.5 ? "Tuyệt hảo" : rt.rating >= 4 ? "Rất tốt" : rt.rating > 0 ? "Tốt" : "Chưa có đánh giá"}
                      </p>
                      <p className="text-[10px] text-slate-500">{rt.reviewCount || 0} đánh giá</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-[10px] text-slate-500">Bắt đầu từ</p>
                    <p className="text-lg font-bold text-slate-900">VND {new Intl.NumberFormat("vi-VN").format(rt.basePrice || 0)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* Section: Popular Keywords */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-[#1F649C]" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tìm kiếm phổ biến</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickDeals.map((deal) => (
              <button
                key={deal}
                className="group flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:border-[#1F649C]/30 hover:bg-[#1F649C]/5 hover:text-[#1F649C]"
              >
                <Search size={16} className="text-slate-400 group-hover:text-[#1F649C]" />
                {deal}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Destinations />
      <FeaturedHotels />
      <Testimonials />
    </div>
  );
};

export default HomePage;
