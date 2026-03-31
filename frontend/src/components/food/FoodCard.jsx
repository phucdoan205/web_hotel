import React from "react";
import { ShoppingCart, Star } from "lucide-react";

const FoodCard = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-56 bg-slate-50 flex items-center justify-center p-8">
        <img
          src={item.image}
          alt={item.name}
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={12} fill="#fbbf24" className="text-amber-400" />
          <span className="text-[10px] font-bold text-slate-700">
            {item.rating}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
        <p className="text-slate-400 text-xs mb-4 flex items-center gap-1">
          📍 {item.hotel}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Starts from
            </p>
            <p className="text-blue-600 font-black text-lg">
              IDR {item.price.toLocaleString()}
            </p>
          </div>
          <button className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
