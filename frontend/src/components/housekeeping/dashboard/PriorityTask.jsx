import React from "react";

const PriorityTask = () => {
  const urgentRooms = [
    { id: "101", type: "Deluxe King", eta: "14:00", status: "URGENT" },
    { id: "204", type: "Superior Twin", eta: "15:30", status: "URGENT" },
    { id: "305", type: "Suite Garden", eta: "13:00", status: "URGENT" },
  ];

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-rose-500 font-black text-xl">!</span>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
            Ưu tiên dọn dẹp (Check-in sớm)
          </h3>
        </div>
        <button className="text-[10px] font-black text-[#0085FF] hover:underline uppercase">
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {urgentRooms.map((room) => (
          <div
            key={room.id}
            className="p-5 rounded-[2rem] border-l-[6px] border-l-rose-500 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-base font-black text-gray-900 leading-none">
                Room {room.id}
              </h4>
              <span className="text-[8px] font-black bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {room.status}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mb-4">
              {room.type}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase">
                  ETA
                </span>
                <span className="text-[11px] font-black text-gray-700">
                  {room.eta}
                </span>
              </div>
              <button className="bg-white text-[#0085FF] text-[10px] font-black px-4 py-2 rounded-xl border border-blue-50 shadow-sm group-hover:bg-[#0085FF] group-hover:text-white transition-colors">
                Gán
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PriorityTask;
