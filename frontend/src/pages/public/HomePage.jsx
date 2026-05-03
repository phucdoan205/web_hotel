import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent, BedDouble, Building2, ChevronLeft, ChevronRight, Heart, Home, Landmark, Palmtree, Search, Star } from "lucide-react";
import { isFavoriteRoomType, toggleFavoriteRoomType } from "../../utils/userFavorites";
import { getStoredAuth } from "../../utils/authStorage";
import Hero from "../../components/home/Hero";
import FeaturedHotels from "../../components/home/FeaturedHotels";
import Destinations from "../../components/home/Destinations";
import Testimonials from "../../components/home/Testimonials";

import { useQuery } from "@tanstack/react-query";
import { roomTypesApi } from "../../api/public/roomTypesApi";
import { getPublicAttractions } from "../../api/admin/attractionsApi";
import { getPublicVouchers, saveVoucher, getMyVouchers } from "../../api/user/userVouchersApi";
import { getArticles } from "../../api/articles/articleApi";
import VoucherViewModal from "../../components/shared/VoucherViewModal";
import toast from "react-hot-toast";

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

  const { data: vouchersData } = useQuery({
    queryKey: ["home-public-vouchers"],
    queryFn: () => getPublicVouchers(),
  });

  const { data: myVouchersData, refetch: refetchMyVouchers } = useQuery({
    queryKey: ["home-my-vouchers"],
    queryFn: () => getMyVouchers(),
    enabled: !!getStoredAuth()?.token, // Chỉ fetch nếu đã đăng nhập
  });

  const [savingVoucherId, setSavingVoucherId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const handleSaveVoucher = async (e, voucherId) => {
    e.stopPropagation();
    if (isVoucherSaved(voucherId)) return;
    
    setSavingVoucherId(voucherId);
    try {
      await saveVoucher(voucherId);
      toast.success("Đã lưu voucher vào ví của bạn!");
      refetchMyVouchers(); // Cập nhật lại danh sách đã lưu
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu voucher. Vui lòng đăng nhập.");
    } finally {
      setSavingVoucherId(null);
    }
  };

  const isVoucherSaved = (voucherId) => {
    return myVouchersData?.data?.some(uv => uv.voucherId === voucherId);
  };

  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ["home-recent-articles"],
    queryFn: () => getArticles({ page: 1, pageSize: 3 }),
  });
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

      {/* Section: Offers & Promo - Redesigned to 'Ưu đãi cho bạn' */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Ưu đãi cho bạn</h2>
          <Link 
            to="/offers"
            className="flex items-center gap-1.5 text-sm font-black text-orange-600 transition hover:gap-2 hover:text-orange-700"
          >
            Xem tất cả ưu đãi
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vouchersData?.data?.slice(0, 3).map((voucher) => {
            const isExpired = voucher.validTo && new Date(voucher.validTo) < new Date();
            
            return (
              <div 
                key={voucher.id}
                onClick={() => !isExpired && setSelectedVoucher(voucher)}
                className={`group relative flex overflow-hidden rounded-2xl border border-dashed bg-white shadow-sm transition-all ${isExpired ? 'border-slate-200 cursor-not-allowed opacity-75 grayscale' : 'border-orange-200 cursor-pointer hover:shadow-md'}`}
              >
                <div className="flex flex-1 flex-col p-6">
                  <h3 className={`text-base font-black line-clamp-2 min-h-[48px] ${isExpired ? 'text-slate-400' : 'text-slate-900'}`}>
                    {voucher.name}
                  </h3>
                  <p className="mt-3 text-xs font-bold text-slate-400">
                    Mã ưu đãi: <span className={isExpired ? 'text-slate-400' : 'text-slate-600'}>{voucher.code}</span>
                  </p>
                </div>
                
                <div className={`relative flex w-40 flex-col items-center justify-center border-l border-dashed p-6 text-white ${isExpired ? 'border-slate-100 bg-slate-400' : 'border-orange-100 bg-orange-500'}`}>
                  {/* Ticket notches */}
                  <div className={`absolute -left-2 -top-2 size-4 rounded-full ${isExpired ? 'bg-slate-50' : 'bg-[#f8fafc]'}`} />
                  <div className={`absolute -left-2 -bottom-2 size-4 rounded-full ${isExpired ? 'bg-slate-50' : 'bg-[#f8fafc]'}`} />
                  
                  <div className="text-center">
                    <p className="text-lg font-black uppercase tracking-tight">
                      Giảm {voucher.discountType === "PERCENT" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()} VND`}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold leading-tight opacity-95">
                      {voucher.minBookingValue ? `Đơn tối thiểu: ${voucher.minBookingValue.toLocaleString()} VND` : "Không cần đơn tối thiểu"}
                    </p>
                  </div>
                  
                  {!isExpired ? (
                    <button 
                      onClick={(e) => handleSaveVoucher(e, voucher.id)}
                      disabled={isVoucherSaved(voucher.id) || savingVoucherId === voucher.id}
                      className={`mt-4 w-full rounded-full py-2 text-xs font-black shadow-sm transition active:scale-95 ${
                        isVoucherSaved(voucher.id) 
                          ? 'bg-orange-100/20 text-white cursor-default' 
                          : 'bg-white text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {savingVoucherId === voucher.id ? "Đang lưu..." : isVoucherSaved(voucher.id) ? "Đã lưu" : "Lưu mã"}
                    </button>
                  ) : (
                    <div className="mt-4 w-full rounded-full bg-slate-100/20 py-2 text-center text-xs font-black text-white/50">
                      Hết hạn
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedVoucher && (
        <VoucherViewModal 
          voucher={selectedVoucher} 
          onClose={() => setSelectedVoucher(null)} 
        />
      )}

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


      <Destinations />

      {/* Section: Recent Articles */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Bài viết gần đây</h2>
            <p className="mt-2 font-medium text-slate-500">Cập nhật những xu hướng và kinh nghiệm du lịch mới nhất.</p>
          </div>
          <Link 
            to="/articles"
            className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Xem tất cả bài viết
            <ArrowRight size={16} className="text-[#1F649C]" />
          </Link>
        </div>

        {isLoadingArticles ? (
          <div className="grid gap-8 md:grid-cols-3">
             {[1, 2, 3].map(i => <div key={i} className="h-80 animate-pulse rounded-[2.5rem] bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {articlesData?.slice(0, 3)?.map((article) => (
              <article key={article.id} className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={article.thumbnailUrl || "https://images.unsplash.com/photo-1506012733851-bb3f3e2c3d10?auto=format&fit=crop&w=800&q=80"} 
                    alt={article.title} 
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute left-6 top-6">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#1F649C] backdrop-blur-sm">
                      {article.categoryName || "Discovery"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-[#1F649C] transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 line-clamp-3">
                    {article.summary}
                  </p>
                  <Link 
                    to={`/articles/${article.slug}`}
                    className="mt-8 flex items-center gap-2 text-sm font-black text-[#1F649C]"
                  >
                    Đọc tiếp <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        
        <div className="mt-12 flex sm:hidden justify-center">
            <Link 
                to="/articles"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-black text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
                Xem tất cả bài viết
                <ArrowRight size={16} className="text-[#1F649C]" />
            </Link>
        </div>
      </section>

      <Testimonials />
    </div>
  );
};

export default HomePage;
