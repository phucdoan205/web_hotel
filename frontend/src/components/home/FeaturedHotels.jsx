import React from "react";
import { Heart, MapPin, Star, ArrowRight } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { roomTypesApi } from "../../api/public/roomTypesApi";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const FeaturedHotels = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-room-types"],
    queryFn: () => roomTypesApi.getPublicRoomTypes({ page: 1, pageSize: 4 }),
  });

  const hotels = data?.items?.map(rt => ({
    id: rt.id,
    name: rt.name,
    location: "Khu vực trung tâm", // RoomTypes don't have location, providing a default
    price: formatCurrency(rt.basePrice),
    score: "9.5",
    reviews: "Đánh giá tuyệt vời",
    image: rt.primaryImageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  })) || [];

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Đang tải danh sách phòng...</div>;
  if (!hotels.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Kiệt tác nghỉ dưỡng</h2>
          <p className="mt-2 font-medium text-slate-500">
            Những lựa chọn hàng đầu cho hành trình thượng lưu của bạn.
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-[#1F649C] transition hover:gap-3">
          Khám phá tất cả <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hotels.map((hotel) => (
          <article key={hotel.id} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-2xl">
            <div className="relative h-64 overflow-hidden">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button className="absolute right-4 top-4 rounded-2xl bg-white/20 p-2.5 text-white backdrop-blur-md transition hover:bg-rose-500 hover:text-white">
                <Heart size={20} />
              </button>
              <div className="absolute bottom-4 left-4">
                 <div className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-900">
                    <Star size={12} fill="currentColor" />
                    Bestseller
                 </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="line-clamp-1 text-lg font-black text-slate-900">{hotel.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-400">
                    <MapPin size={14} className="text-slate-300" />
                    {hotel.location}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-xl bg-slate-900 px-2.5 py-1 text-sm font-black text-white">
                    {hotel.score}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuyệt vời</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giá chỉ từ</p>
                  <p className="text-xl font-black text-[#1F649C]">{hotel.price}</p>
                </div>
                <button className="rounded-xl bg-slate-100 p-3 text-slate-900 transition hover:bg-slate-900 hover:text-white">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedHotels;
