import React from "react";
import { MapPin, Star } from "lucide-react";

const Recommendation = () => {
  const hotels = [
    {
      id: 1,
      name: "Park Royal Collection",
      location: "District 1",
      price: 120,
      rating: 4.9,
      img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    },
    {
      id: 2,
      name: "InterContinental Danang",
      location: "Son Tra",
      price: 340,
      rating: 4.7,
      img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    },
    {
      id: 3,
      name: "The Reverie Saigon",
      location: "District 1",
      price: 295,
      rating: 4.8,
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-md transition-all cursor-pointer"
        >
          <div className="relative h-32">
            <img
              src={hotel.img}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm">
              <Star size={10} className="fill-orange-400 text-orange-400" />{" "}
              {hotel.rating}
            </div>
          </div>
          <div className="p-4">
            <h4 className="text-[11px] font-black text-gray-900 truncate">
              {hotel.name}
            </h4>
            <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {hotel.location}
            </p>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs font-black text-[#0085FF]">
                ${hotel.price}
                <span className="text-[9px] text-gray-300 font-bold">
                  /night
                </span>
              </p>
              <button className="text-[9px] font-black uppercase text-gray-900 hover:text-[#0085FF] transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendation;
