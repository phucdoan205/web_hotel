import React from "react";
import { Heart, MapPin, Star } from "lucide-react";

const hotels = [
  {
    id: 1,
    name: "Seaside Boutique Hotel",
    location: "Mỹ Khê, Đà Nẵng",
    price: "1.250.000 đ",
    score: "9,1",
    reviews: "1.248 đánh giá",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Central Saigon Stay",
    location: "Quận 1, TP. Hồ Chí Minh",
    price: "980.000 đ",
    score: "8,8",
    reviews: "936 đánh giá",
    image: "https://images.unsplash.com/photo-1551882547-ff43c637f68b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Old Quarter Residence",
    location: "Hoàn Kiếm, Hà Nội",
    price: "1.120.000 đ",
    score: "9,0",
    reviews: "742 đánh giá",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Pine Hill Resort",
    location: "Đà Lạt, Lâm Đồng",
    price: "1.480.000 đ",
    score: "9,3",
    reviews: "618 đánh giá",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedHotels = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Chỗ nghỉ được khách yêu thích</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Gợi ý dựa trên điểm đánh giá, vị trí và mức giá dễ đặt.
          </p>
        </div>
        <button className="text-sm font-bold text-[#0071c2] hover:underline">Xem tất cả</button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {hotels.map((hotel) => (
          <article key={hotel.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="relative h-48 overflow-hidden">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm transition hover:text-rose-600">
                <Heart size={18} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-1 text-base font-black text-slate-950">{hotel.name}</h3>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-500">
                <MapPin size={14} />
                {hotel.location}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#003b95] px-2 py-1 text-sm font-black text-white">
                    {hotel.score}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{hotel.reviews}</span>
                </div>
                <div className="flex text-[#febb02]">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Star key={item} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-right text-xs font-semibold text-slate-500">Từ</p>
              <p className="text-right text-lg font-black text-slate-950">{hotel.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedHotels;
