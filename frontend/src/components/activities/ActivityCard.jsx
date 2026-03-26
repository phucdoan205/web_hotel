import React from "react";
import { Star, Clock, Heart } from "lucide-react";

const ActivityCard = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-xl transition-all">
      <div className="relative h-48 overflow-hidden">
        <img
          src={data.image}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
          alt={data.title}
        />
        <div className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
          {data.tag}
        </div>
        <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all">
          <Heart size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 text-slate-400 text-[11px] mb-2 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {data.duration}
          </span>
          <span className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" /> {data.rating} ({data.reviews}
            )
          </span>
        </div>

        <h3 className="font-bold text-slate-800 mb-4 line-clamp-2 h-10 leading-tight">
          {data.title}
        </h3>

        <div className="flex justify-between items-end border-t pt-4">
          <div>
            <p className="text-[10px] text-slate-400 font-bold line-through">
              IDR {data.oldPrice}
            </p>
            <p className="text-orange-600 font-black text-lg">
              IDR {data.price}
            </p>
          </div>
          <button className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
