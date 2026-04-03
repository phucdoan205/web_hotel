import React from "react";
import { Star, Heart } from "lucide-react";

const hotels = [
  {
    id: 1,
    name: "The Ritz-Carlton",
    location: "Nusa Dua, Bali",
    price: "$450",
    rating: 5,
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500",
  },
  {
    id: 2,
    name: "Aman Tokyo",
    location: "Chiyoda, Tokyo",
    price: "$1,200",
    rating: 5,
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
  },
  {
    id: 3,
    name: "Four Seasons",
    location: "Paris, France",
    price: "$980",
    rating: 5,
    img: "https://images.unsplash.com/photo-1551882547-ff43c637f68b?w=500",
  },
  {
    id: 4,
    name: "Marina Bay Sands",
    location: "Singapore",
    price: "$650",
    rating: 5,
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500",
  },
];

const FeaturedHotels = () => {
  return (
    <section className="py-20 max-w-7xl mx-auto px-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Featured Hotels</h2>
          <p className="text-slate-500">
            Handpicked hotels based on your preference
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border rounded-full hover:bg-slate-50">
            ←
          </button>
          <button className="p-2 border rounded-full hover:bg-slate-50">
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl h-60 mb-3">
              <img
                src={hotel.img}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500">
                <Heart
                  size={18}
                  fill="currentColor"
                  className="text-transparent hover:text-red-500"
                />
              </button>
            </div>
            <h3 className="font-bold text-slate-800">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-yellow-500 mb-1">
              {[...Array(hotel.rating)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
              <span className="text-slate-400 text-xs ml-1">(4,890)</span>
            </div>
            <p className="text-slate-500 text-sm mb-2">📍 {hotel.location}</p>
            <p className="text-blue-600 font-bold">
              {hotel.price}
              <span className="text-slate-400 font-normal text-xs">/night</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedHotels;
