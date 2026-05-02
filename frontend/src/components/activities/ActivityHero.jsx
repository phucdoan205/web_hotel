import React from "react";
import { MapPin, Calendar, LayoutGrid, Search } from "lucide-react";

const ActivityHero = () => {
  return (
    <div className="relative h-[450px] w-full flex items-center justify-center overflow-hidden bg-slate-900">
      <img
        src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        alt="Activities Hero"
      />

      <div className="relative z-10 text-center text-white px-4 mb-12 mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Khám Phá Những Trải Nghiệm Khó Quên
        </h1>
        <p className="text-lg opacity-90">
          Tìm kiếm những địa điểm, hoạt động nổi bật và tuyệt vời nhất cho chuyến đi của bạn.
        </p>
      </div>
    </div>
  );
};

export default ActivityHero;
