import React from "react";
import { Star, Heart, MapPin } from "lucide-react";

const FavoriteCard = ({ hotel }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
    {/* Image Container */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Badge */}
      {hotel.badge && (
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${
            hotel.badge === "RECOMMENDED" ? "bg-emerald-500" : "bg-[#0085FF]"
          }`}
        >
          {hotel.badge}
        </div>
      )}
      {/* Heart Icon */}
      <button className="absolute top-4 right-4 size-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#0085FF] transition-colors">
        <Heart size={18} fill="white" />
      </button>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[15px] font-black text-gray-900 truncate">
          {hotel.name}
        </h4>
        <div className="flex items-center gap-1 text-[11px] font-black text-orange-400">
          <Star size={12} fill="currentColor" />
          <span>{hotel.rating}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mb-6">
        <MapPin size={12} />
        <span>{hotel.location}</span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div>
          <p className="text-[16px] font-black text-[#0085FF]">
            ${hotel.price}{" "}
            <span className="text-[10px] text-gray-300 font-bold uppercase">
              / night
            </span>
          </p>
        </div>
        <button className="px-5 py-2.5 bg-blue-50 text-[#0085FF] text-[11px] font-black rounded-xl hover:bg-[#0085FF] hover:text-white transition-all">
          Book Now
        </button>
      </div>
    </div>
  </div>
);

export default FavoriteCard;
