import React from "react";
import { Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(service.price);

  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.thumbnailUrl || "https://placehold.co/400x300/e2e8f0/64748b?text=Dịch+vụ"}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {service.commentCount > 10 && (
           <div className="absolute left-3 top-3 rounded-lg bg-[#0194f3] px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-lg">
             Bán chạy nhất
           </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900 md:text-base group-hover:text-[#0194f3] transition-colors">
          {service.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star size={14} fill="#fbbf24" className="text-amber-400" />
            <span className="text-xs font-black text-slate-900">{service.averageRating > 0 ? service.averageRating.toFixed(1) : "N/A"}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">({service.commentCount})</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-slate-500">{service.categoryName || "Dịch vụ"}</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
           <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá từ</span>
             <span className="text-base font-black text-[#f12c2c]">{formattedPrice}</span>
           </div>
           
           <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#0194f3] group-hover:text-white transition-colors">
              <Zap size={14} />
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
