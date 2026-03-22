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

      <div className="relative z-10 text-center text-white px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Discover Unforgettable Experiences
        </h1>
        <p className="text-lg opacity-90">
          Find the best tours, attractions, and local gems for your next
          adventure.
        </p>
      </div>

      {/* Search Bar - Chế độ "floating" */}
      <div className="absolute bottom-10 w-full max-w-4xl px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex flex-col border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-8">
              Where to?
            </span>
            <div className="flex items-center gap-2 px-2">
              <MapPin className="text-blue-500" size={18} />
              <input
                type="text"
                placeholder="Bali, Indonesia"
                className="text-sm font-semibold outline-none w-full text-slate-700"
              />
            </div>
          </div>
          <div className="flex flex-col border-r border-slate-100 pr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-8">
              Date
            </span>
            <div className="flex items-center gap-2 px-2">
              <Calendar className="text-blue-500" size={18} />
              <input
                type="text"
                placeholder="Select dates"
                className="text-sm font-semibold outline-none w-full text-slate-700"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-8">
              Activity Type
            </span>
            <div className="flex items-center gap-2 px-2">
              <LayoutGrid className="text-blue-500" size={18} />
              <select className="text-sm font-semibold outline-none w-full bg-transparent text-slate-700">
                <option>All Activities</option>
                <option>Tours</option>
                <option>Workshops</option>
              </select>
            </div>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityHero;
