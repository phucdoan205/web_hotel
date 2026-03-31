import React from "react";

const StaffPerformance = () => {
  const performanceData = [
    { name: "M. Linh", rooms: 5, color: "bg-blue-400" },
    { name: "T. Hùng", rooms: 8, color: "bg-[#0085FF]" },
    { name: "H. Lan", rooms: 4, color: "bg-blue-300" },
    { name: "Q. Anh", rooms: 10, color: "bg-blue-600" },
    { name: "L. Cường", rooms: 7, color: "bg-blue-500" },
    { name: "V. Nam", rooms: 6, color: "bg-blue-200" },
  ];

  const maxRooms = Math.max(...performanceData.map((d) => d.rooms));

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black text-gray-900 uppercase">
          Hiệu suất nhân viên (Phòng đã dọn)
        </h3>
        <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg">
          Hôm nay
        </span>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-2">
        {performanceData.map((staff, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-4 w-full group"
          >
            {/* Cột biểu đồ */}
            <div className="relative w-full flex justify-center items-end">
              {/* Tooltip khi hover */}
              <div className="absolute -top-8 bg-gray-900 text-white text-[9px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {staff.rooms} phòng
              </div>

              <div
                className={`w-10 rounded-t-xl transition-all duration-500 ease-out cursor-pointer ${staff.color} opacity-80 group-hover:opacity-100 group-hover:shadow-lg group-hover:shadow-blue-100`}
                style={{ height: `${(staff.rooms / maxRooms) * 120}px` }}
              />
            </div>
            {/* Tên nhân viên */}
            <p className="text-[9px] font-black text-gray-400 group-hover:text-gray-900 transition-colors text-center whitespace-nowrap">
              {staff.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StaffPerformance;
