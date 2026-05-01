import React from "react";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPublicAttractions } from "../../api/admin/attractionsApi";

const Destinations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["home-destinations"],
    queryFn: () => getPublicAttractions({ page: 1, pageSize: 4 }),
  });

  const destinations = data?.items?.map(attr => ({
    id: attr.id,
    name: attr.name,
    properties: attr.category || "Điểm đến hấp dẫn",
    image: attr.imageUrl || "https://images.unsplash.com/photo-1589782104152-173489855331?auto=format&fit=crop&w=1200&q=80",
  })) || [];

  if (isLoading) return <div className="p-10 text-center font-bold text-slate-400">Đang tải điểm đến...</div>;
  if (!destinations.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Điểm đến thượng lưu</h2>
        <p className="mt-3 font-medium text-slate-500">
          Những tọa độ được giới tinh hoa săn đón nhiều nhất trong mùa này.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {destinations.slice(0, 2).map((city) => (
          <article key={city.name} className="group relative h-[400px] cursor-pointer overflow-hidden rounded-[2.5rem] shadow-xl">
            <img
              src={city.image}
              alt={city.name}
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 text-white transition-transform duration-500 group-hover:-translate-y-2">
              <span className="mb-2 inline-block rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
                Trending
              </span>
              <h3 className="text-4xl font-black">{city.name}</h3>
              <p className="mt-2 text-sm font-semibold text-white/70">{city.properties}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {destinations.slice(2).map((city) => (
          <article key={city.name} className="group relative h-72 cursor-pointer overflow-hidden rounded-[2rem] shadow-lg">
            <img
              src={city.image}
              alt={city.name}
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h3 className="text-2xl font-black">{city.name}</h3>
              <p className="mt-1 text-xs font-semibold text-white/70">{city.properties}</p>
            </div>
          </article>
        ))}
        <article className="flex flex-col justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 transition-colors hover:bg-white hover:border-[#1F649C]/30">
          <h3 className="text-2xl font-black text-slate-900 leading-tight">Khám phá <br /> thêm điểm đến</h3>
          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
            Hơn 2000+ địa điểm tuyệt vời khác đang chờ đợi bạn trải nghiệm.
          </p>
          <button className="mt-6 flex w-fit items-center gap-2 text-sm font-bold text-[#1F649C]">
            Xem tất cả <ArrowRight size={16} />
          </button>
        </article>
      </div>
    </section>
  );
};

export default Destinations;
