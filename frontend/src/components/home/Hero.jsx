import React from "react";
import { BedDouble } from "lucide-react";
import { useSearchNavigation } from "../../hooks/useSearchNavigation";
import HorizontalSearchFilter from "../public/bookings/HorizontalSearchFilter";

const bannerImage =
  "https://decoxdesign.com/upload/images/hotel-caitilin-1952m2-sanh-14-decox-design.jpg";

const Hero = () => {
  const { searchParams, updateField, handleSearch } = useSearchNavigation();

  return (
    <section className="relative text-white">
      <img
        src={bannerImage}
        alt="Khách sạn nghỉ dưỡng"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#01539d]/80 via-[#01539d]/50 to-[#01539d]/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent opacity-60" />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Tìm chỗ nghỉ tiếp theo của bạn
          </h1>
          <p className="mt-4 text-lg font-semibold text-white/90">
            Tìm ưu đãi khách sạn, căn hộ và resort với trải nghiệm tìm kiếm nhanh gọn.
          </p>
        </div>

        <div className="mt-10">
          <HorizontalSearchFilter
            filters={searchParams}
            onChange={updateField}
            onSubmit={handleSearch}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/20 px-4 py-2 backdrop-blur hover:bg-white/30 cursor-pointer transition">
            <BedDouble size={16} />
            Khách sạn
          </span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20 cursor-pointer transition">Căn hộ</span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20 cursor-pointer transition">Resort</span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur hover:bg-white/20 cursor-pointer transition">Villa</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
