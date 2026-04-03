import React from "react";

const statusConfig = {
  AVAILABLE: {
    color: "bg-emerald-500",
    label: "AVAILABLE",
    lightBg: "bg-emerald-50 text-emerald-600",
  },
  OCCUPIED: {
    color: "bg-blue-500",
    label: "OCCUPIED",
    lightBg: "bg-blue-50 text-blue-600",
  },
  DIRTY: {
    color: "bg-amber-500",
    label: "DIRTY",
    lightBg: "bg-amber-50 text-amber-600",
  },
  MAINTENANCE: {
    color: "bg-rose-500",
    label: "MAINTENANCE",
    lightBg: "bg-rose-50 text-rose-600",
  },
};

const RoomCard = ({ room, onClick }) => {
  const config = statusConfig[room.status];

  return (
    <div
      onClick={() => onClick(room)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-32"
    >
      <div className={`w-1.5 ${config.color}`} />
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex justify-between items-start">
          <span className="text-xl font-black text-gray-800">{room.id}</span>
          <span
            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${config.lightBg}`}
          >
            {config.label}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            {room.type}
          </p>
          {room.guest && (
            <p className="text-[10px] font-medium text-gray-600 italic">
              Guest: {room.guest}
            </p>
          )}
          {room.checkout && (
            <p className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
              🔔 Checkout: {room.checkout}
            </p>
          )}
          {room.note && (
            <p className="text-[10px] font-medium text-rose-500 italic">
              {room.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
