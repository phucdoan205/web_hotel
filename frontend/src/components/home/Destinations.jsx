import React from "react";

const destinations = [
  {
    name: "Đà Nẵng",
    properties: "1.284 chỗ nghỉ",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "TP. Hồ Chí Minh",
    properties: "2.031 chỗ nghỉ",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Hà Nội",
    properties: "1.756 chỗ nghỉ",
    image: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Đà Lạt",
    properties: "942 chỗ nghỉ",
    image: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=900&q=80",
  },
];

const Destinations = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-950">Điểm đến đang thịnh hành</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Những nơi được khách Việt tìm kiếm nhiều cho kỳ nghỉ sắp tới.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {destinations.slice(0, 2).map((city) => (
          <article key={city.name} className="group relative h-64 overflow-hidden rounded-lg shadow-sm">
            <img
              src={city.image}
              alt={city.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <h3 className="text-2xl font-black">{city.name}</h3>
              <p className="mt-1 text-sm font-semibold text-white/80">{city.properties}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {destinations.slice(2).map((city) => (
          <article key={city.name} className="group relative h-56 overflow-hidden rounded-lg shadow-sm">
            <img
              src={city.image}
              alt={city.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <h3 className="text-xl font-black">{city.name}</h3>
              <p className="mt-1 text-sm font-semibold text-white/80">{city.properties}</p>
            </div>
          </article>
        ))}
        <article className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <h3 className="text-xl font-black text-slate-950">Khám phá thêm</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lọc theo điểm đến, ngày lưu trú và số khách để tìm danh sách khách sạn phù hợp hơn.
          </p>
        </article>
      </div>
    </section>
  );
};

export default Destinations;
