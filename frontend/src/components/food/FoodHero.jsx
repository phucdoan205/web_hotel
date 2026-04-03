import React from "react";

const FoodHero = () => {
  return (
    <div className="relative h-[400px] w-full rounded-b-[40px] overflow-hidden">
      {/* Background Image - Bạn có thể thay bằng ảnh món ăn thực tế */}
      <img
        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Dining Hero"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-20">
        <div className="max-w-xl text-white">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/30">
            Exclusive Offers
          </span>
          <h1 className="text-5xl font-bold mt-4 mb-4 leading-tight">
            Delicious Dining at Our Hotels
          </h1>
          <p className="text-lg text-slate-200 mb-8 leading-relaxed">
            Savor exclusive culinary experiences and special restaurant offers
            at our luxury partner hotels worldwide.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">
              Explore Offers
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all">
              View Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodHero;
