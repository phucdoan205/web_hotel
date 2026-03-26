import React from "react";

const destinations = [
  {
    name: "Bali",
    properties: "1,234 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
  },
  {
    name: "Tokyo",
    properties: "2,567 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
  },
  {
    name: "Paris",
    properties: "1,890 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
  },
  {
    name: "Sydney",
    properties: "980 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400",
  },
  {
    name: "Dubai",
    properties: "1,120 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
  },
  {
    name: "San Francisco",
    properties: "750 properties",
    loading : "lazy",
    img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400",
  },
];

const Destinations = () => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Popular Destinations
          </h2>
          <p className="text-slate-500 text-sm">
            Most loved places by our travelers
          </p>
        </div>
        <button className="text-blue-500 font-bold text-sm hover:underline">
          See all →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((city, index) => (
          <div
            key={index}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md"
          >
            <img
              src={city.img}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-lg">{city.name}</h3>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">
                {city.properties}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Destinations;
