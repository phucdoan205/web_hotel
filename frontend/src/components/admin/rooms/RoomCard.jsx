import React from "react";
import { MapPin, BedDouble, Heart } from "lucide-react";

const RoomCard = ({ room }) => {
  const statusColors = {
    AVAILABLE: "bg-emerald-500",
    OCCUPIED: "bg-orange-500",
    MAINTENANCE: "bg-amber-500",
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span
            className={`px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-tighter flex items-center gap-1 ${statusColors[room.status]}`}
          >
            <span className="size-1 bg-white rounded-full animate-pulse" />
            {room.status}
          </span>
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-rose-500 transition-all">
          <Heart className="size-4" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 leading-tight">{room.name}</h4>
          <span className="text-orange-600 font-black text-sm">
            ${room.price}
            <span className="text-[10px] text-gray-400 font-medium">/nt</span>
          </span>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
            <MapPin className="size-3" /> Floor {room.floor}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
            <BedDouble className="size-3" /> {room.type}
          </div>
        </div>

        <button className="w-full mt-5 py-2.5 bg-gray-50 text-gray-900 text-xs font-black rounded-xl hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">
          Manage Details
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
