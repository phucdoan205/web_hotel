import React from "react";
import { X, User, Wifi, Wind, MapPin, Coffee, Zap } from "lucide-react";

const RoomDetailsSidebar = ({ room, onClose }) => {
  if (!room) return null;

  const features = [
    { icon: <Wifi size={14} />, label: "Free Wi-Fi" },
    { icon: <Zap size={14} />, label: "King Bed" },
    { icon: <Coffee size={14} />, label: "Mini Bar" },
    { icon: <MapPin size={14} />, label: "City View" },
  ];

  return (
    <div className="w-[400px] bg-white border-l border-gray-100 h-screen flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-50">
      {/* Sidebar Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-50">
        <h2 className="text-xl font-black text-gray-900">Room Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Room Image */}
        <div className="relative group">
          <div className="rounded-[2rem] overflow-hidden h-52 bg-gray-100 border-4 border-white shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt="Room preview"
            />
          </div>
          <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            Room {room.id}
          </span>
        </div>

        {/* Current Status Badge */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Current Status
          </p>
          <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <div className="size-3 rounded-full bg-[#0085FF] animate-pulse" />
            <p className="font-black text-[#0085FF] text-sm uppercase tracking-wider">
              {room.status}
            </p>
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-gray-50/80 p-5 rounded-[2rem] border border-gray-100 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Guest Information
          </p>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              {room.guest ? (
                <img
                  src={`https://ui-avatars.com/api/?name=${room.guest}&background=random`}
                  alt="avatar"
                />
              ) : (
                <User className="text-gray-300" size={24} />
              )}
            </div>
            <div>
              <p className="text-sm font-black text-gray-800">
                {room.guest || "Vacant Room"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 italic">
                {room.guest
                  ? "Check-out: Tomorrow, 11:00 AM"
                  : "No active booking"}
              </p>
            </div>
          </div>
        </div>

        {/* Features Chips */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Room Features
          </p>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 shadow-sm"
              >
                <span className="text-blue-500">{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-50 space-y-3 bg-white">
        <button className="w-full bg-[#0085FF] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-[0.98]">
          Check-out Guest
        </button>
        <button className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">
          Service Request
        </button>
      </div>
    </div>
  );
};

export default RoomDetailsSidebar;
