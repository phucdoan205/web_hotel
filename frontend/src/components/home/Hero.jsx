import React from "react";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { useSearchNavigation } from "../../hooks/useSearchNavigation";

const Hero = () => {
  // Gọi các giá trị từ custom hook
  const { searchParams, updateField, handleSearch } = useSearchNavigation();

  return (
    <div className="relative h-125 w-full flex items-center justify-center">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2000"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Hero Background"
      />
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Overlay cho text dễ đọc */}
      <div className="absolute top-1/4 left-0 w-full flex flex-col items-center z-10">
        <h1 className="text-5xl font-bold mb-2 text-white drop-shadow-lg">
          Find Your Next Adventure
        </h1>
        <p className="text-lg text-white opacity-90 mb-10 drop-shadow">
          Book the best hotels at the lowest prices, guaranteed.
        </p>
      </div>
      {/* Search Bar */}
      <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 w-full max-w-5xl px-4 z-20">
        <div className="flex flex-row bg-white rounded-2xl shadow-lg py-4 px-6 gap-4 items-center">
          {/* Destination Input */}
          <div className="flex flex-col flex-1 min-w-45">
            {/* Hidden label for accessibility */}
            <label className="sr-only">Destination</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-slate-50">
              <MapPin className="text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Where are you going?"
                className="bg-transparent outline-none text-sm w-full"
                value={searchParams.destination}
                onChange={(e) => updateField("destination", e.target.value)}
              />
            </div>
          </div>
          {/* Dates Input */}
          <div className="flex flex-col flex-1 min-w-45">
            <label className="sr-only">Dates</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-slate-50">
              <Calendar className="text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Check-in – Check-out"
                className="bg-transparent outline-none text-sm w-full"
                value={searchParams.dates}
                onChange={(e) => updateField("dates", e.target.value)}
              />
            </div>
          </div>
          {/* Guests Input */}
          <div className="flex flex-col flex-1 min-w-45">
            <label className="sr-only">Guests & Rooms</label>
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-slate-50">
              <Users className="text-slate-400" size={18} />
              <input
                type="text"
                placeholder="2 Guests, 1 Room"
                className="bg-transparent outline-none text-sm w-full"
                value={searchParams.guests}
                onChange={(e) => updateField("guests", e.target.value)}
              />
            </div>
          </div>
          {/* Nút Search */}
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 px-8 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
