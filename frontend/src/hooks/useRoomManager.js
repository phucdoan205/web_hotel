import { useState } from "react";
import { MOCK_ROOMS } from "../constants/RoomMockData";

export const useRoomManager = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterFloor, setFilterFloor] = useState("All Floors");

  const roomsByFloor = MOCK_ROOMS.reduce((acc, room) => {
    if (filterFloor !== "All Floors" && `Floor ${room.floor}` !== filterFloor)
      return acc;
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  return { roomsByFloor, selectedRoom, setSelectedRoom, setFilterFloor };
};
