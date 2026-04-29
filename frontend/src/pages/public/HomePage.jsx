import React from "react";
import { ArrowRight, BadgePercent, BedDouble, Building2, Home, Landmark, Palmtree } from "lucide-react";
import Hero from "../../components/home/Hero";
import FeaturedHotels from "../../components/home/FeaturedHotels";
import Destinations from "../../components/home/Destinations";
import Testimonials from "../../components/home/Testimonials";

const propertyTypes = [
  {
    name: "Khách sạn",
    count: "423 chỗ nghỉ",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Căn hộ",
    count: "188 lựa chọn",
    icon: Home,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Resort",
    count: "96 khu nghỉ dưỡng",
    icon: Palmtree,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Villa",
    count: "72 biệt thự",
    icon: Landmark,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",
  },
];

const quickDeals = [
  "Đà Nẵng cuối tuần",
  "Khách sạn gần biển",
  "Phòng gia đình",
  "Nghỉ dưỡng có hồ bơi",
  "Chỗ nghỉ được đánh giá cao",
];

const HomePage = () => {
  return (
    <div className="bg-white">
      <Hero />

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-[#0071c2]">
                  <BadgePercent size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">Ưu đãi cho chuyến đi kế tiếp</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Tiết kiệm hơn khi đặt sớm hoặc chọn các chỗ nghỉ đang có giá tốt.
                  </p>
                </div>
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#0071c2] px-4 text-sm font-bold text-[#0071c2] transition hover:bg-blue-50">
                Xem ưu đãi
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-[#003b95] p-5 text-white shadow-sm">
            <p className="text-sm font-semibold text-blue-100">Tài khoản của bạn</p>
            <h3 className="mt-2 text-xl font-black">Đăng nhập để xem giá riêng</h3>
            <p className="mt-2 text-sm text-blue-100">
              Theo dõi booking, thanh toán và nhận gợi ý phù hợp hơn.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-950">Tìm theo loại chỗ nghỉ</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Chọn nhanh phong cách lưu trú phù hợp với chuyến đi của bạn.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {propertyTypes.map((item) => (
            <article key={item.name} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="h-40 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-blue-50 p-2 text-[#0071c2]">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-950">{item.name}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{item.count}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <BedDouble size={20} className="text-[#0071c2]" />
          <h2 className="text-2xl font-black text-slate-950">Tìm kiếm phổ biến</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickDeals.map((deal) => (
            <button
              key={deal}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#0071c2] hover:text-[#0071c2]"
            >
              {deal}
            </button>
          ))}
        </div>
      </section>

      <Destinations />
      <FeaturedHotels />
      <Testimonials />
    </div>
  );
};

export default HomePage;
