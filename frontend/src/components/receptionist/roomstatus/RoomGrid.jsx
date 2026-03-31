import React from "react";
import RoomCard from "./RoomCard";

const RoomGrid = ({ roomsByFloor, onRoomClick }) => {
  return (
    <div className="space-y-10 pb-10">
      {Object.entries(roomsByFloor).map(([floor, rooms]) => (
        <div
          key={floor}
          className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Floor {floor}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={onRoomClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomGrid;
