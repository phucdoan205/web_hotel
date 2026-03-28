import React from "react";

const RoomTable = () => {
  const rooms = [
    {
      id: "101",
      type: "Deluxe",
      status: "Clean",
      staff: "Nguyễn Văn A",
      note: "Khách check-out 10h",
      statusColor: "bg-emerald-50 text-emerald-500",
    },
    {
      id: "102",
      type: "Suite",
      status: "Dirty",
      staff: "Trần Thị B",
      note: "Cần dọn gấp",
      statusColor: "bg-rose-50 text-rose-500",
    },
    {
      id: "205",
      type: "Standard",
      status: "Cleaning",
      staff: "Lê Văn C",
      note: "Dọn định kỳ",
      statusColor: "bg-orange-50 text-orange-500",
    },
    {
      id: "308",
      type: "Deluxe",
      status: "Maintenance",
      staff: "Kỹ thuật",
      note: "Hỏng vòi nước",
      statusColor: "bg-gray-100 text-gray-500",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {[
              "Số phòng",
              "Loại phòng",
              "Trạng thái",
              "Nhân viên phụ trách",
              "Ghi chú",
              "Thao tác",
            ].map((head) => (
              <th
                key={head}
                className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rooms.map((room) => (
            <tr key={room.id} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5 text-sm font-black text-gray-900">
                {room.id}
              </td>
              <td className="px-8 py-5 text-xs font-bold text-gray-500">
                {room.type}
              </td>
              <td className="px-8 py-5">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${room.statusColor}`}
                >
                  ● {room.status}
                </span>
              </td>
              <td className="px-8 py-5 text-xs font-black text-gray-900">
                {room.staff}
              </td>
              <td className="px-8 py-5 text-xs font-medium text-gray-400 italic">
                {room.note}
              </td>
              <td className="px-8 py-5">
                <button className="text-[#0085FF] text-[11px] font-black hover:underline uppercase">
                  Cập nhật
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="p-6 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Hiển thị 1-5 của 120 phòng
        </p>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`size-8 rounded-lg text-xs font-black ${n === 1 ? "bg-[#0085FF] text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomTable;
