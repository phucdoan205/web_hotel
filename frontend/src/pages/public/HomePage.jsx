import React from "react";
import { ArrowRight, BadgePercent, BedDouble, Building2, Home, Landmark, Palmtree, Search } from "lucide-react";
import Hero from "../../components/home/Hero";
import FeaturedHotels from "../../components/home/FeaturedHotels";
import Destinations from "../../components/home/Destinations";
import Testimonials from "../../components/home/Testimonials";

import { useQuery } from "@tanstack/react-query";
import { roomTypesApi } from "../../api/admin/roomTypesApi";
import { getPublicAttractions } from "../../api/admin/attractionsApi";

const HomePage = () => {
  const { data: roomTypesData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["home-room-types"],
    queryFn: () => roomTypesApi.getPublicRoomTypes({ page: 1, pageSize: 4 }),
  });

  const { data: attractionsData, isLoading: isLoadingAttractions } = useQuery({
    queryKey: ["home-attractions"],
    queryFn: () => getPublicAttractions({ page: 1, pageSize: 4 }),
  });

  const propertyTypes = roomTypesData?.items?.map(rt => ({
    name: rt.name,
    count: `${rt.roomCount || 0} phòng trống`,
    icon: Building2,
    image: rt.primaryImageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    id: rt.id
  })) || [];

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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Khám phá theo phong cách</h2>
            <p className="mt-2 font-medium text-slate-500">
              Từ căn hộ hiện đại đến resort biệt lập, hãy chọn không gian cho riêng mình.
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {propertyTypes.map((item) => (
            <article 
              key={item.name} 
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
                  <span className="text-xs font-bold uppercase tracking-widest">Khám phá</span>
                  <ArrowRight size={14} />
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4 inline-flex rounded-xl bg-slate-50 p-2.5 text-[#1F649C]">
                  <item.icon size={22} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-400 uppercase tracking-wide">{item.count}</p>
              </div>
            </article>
          ))}
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
