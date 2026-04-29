import React from "react";
import { BedDouble, CalendarDays, MapPin, Search, UsersRound } from "lucide-react";
import { useSearchNavigation } from "../../hooks/useSearchNavigation";

const bannerImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=85";

const Hero = () => {
  const { searchParams, updateField, handleSearch } = useSearchNavigation();

  return (
    <section className="relative overflow-hidden text-white">
      <img
        src={bannerImage}
        alt="Khách sạn nghỉ dưỡng"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/15" />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Tìm chỗ nghỉ tiếp theo của bạn
          </h1>
          <p className="mt-4 text-lg font-semibold text-white/90">
            Tìm ưu đãi khách sạn, căn hộ và resort với trải nghiệm tìm kiếm nhanh gọn.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="mt-10 grid gap-1 rounded-lg bg-[#febb02] p-1 shadow-2xl md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_150px]"
        >
          <label className="flex min-h-14 items-center gap-3 rounded-md bg-white px-4 text-slate-900">
            <MapPin size={20} className="shrink-0 text-slate-500" />
            <input
              type="text"
              placeholder="Bạn muốn đến đâu?"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500"
              value={searchParams.destination}
              onChange={(event) => updateField("destination", event.target.value)}
            />
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-md bg-white px-4 text-slate-900">
            <CalendarDays size={20} className="shrink-0 text-slate-500" />
            <input
              type="text"
              placeholder="Ngày nhận - trả phòng"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500"
              value={searchParams.dates}
              onChange={(event) => updateField("dates", event.target.value)}
            />
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-md bg-white px-4 text-slate-900">
            <UsersRound size={20} className="shrink-0 text-slate-500" />
            <input
              type="text"
              placeholder="2 khách, 1 phòng"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500"
              value={searchParams.guests}
              onChange={(event) => updateField("guests", event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[#0071c2] px-5 text-base font-bold text-white transition hover:bg-[#005fa3]"
          >
            <Search size={20} />
            Tìm
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur">
            <BedDouble size={16} />
            Khách sạn
          </span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur">Căn hộ</span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur">Resort</span>
          <span className="rounded-full border border-white/45 bg-white/10 px-4 py-2 backdrop-blur">Villa</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
