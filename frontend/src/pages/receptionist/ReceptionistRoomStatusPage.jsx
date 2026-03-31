import React from "react";
import { useRoomManager } from "../../hooks/useRoomManager";
import RoomFilter from "../../components/receptionist/roomstatus/RoomFilter";
import RoomGrid from "../../components/receptionist/roomstatus/RoomGrid";
import RoomDetailsSidebar from "../../components/receptionist/roomstatus/RoomDetailsSidebar";

const ReceptionistRoomStatusPage = () => {
  // Lấy toàn bộ logic quản lý từ Custom Hook
  const { roomsByFloor, selectedRoom, setSelectedRoom, setFilterFloor } =
    useRoomManager();

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Khu vực nội dung chính bên trái */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Header Title */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Trạng thái phòng
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">
              Quản lý danh sách phòng và tình trạng dọn dẹp theo thời gian thực.
            </p>
          </div>

          {/* Thành phần Bộ lọc & Chú thích màu sắc */}
          <RoomFilter setFilterFloor={setFilterFloor} />

          {/* Lưới hiển thị danh sách phòng theo tầng */}
          <RoomGrid roomsByFloor={roomsByFloor} onRoomClick={setSelectedRoom} />
        </div>
      </div>

      {/* Sidebar chi tiết xuất hiện khi chọn phòng */}
      {selectedRoom && (
        <div className="relative h-full flex-shrink-0">
          <RoomDetailsSidebar
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ReceptionistRoomStatusPage;
