import React from "react";

const CheckOutList = () => {
  const checkouts = [
    { name: "Wade Warren", room: "402", time: "11:00 AM" },
    { name: "Eleanor Pena", room: "105", time: "12:30 PM" },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.15em]">
          Upcoming Check-outs
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {checkouts.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-rose-100 hover:bg-rose-50/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-full bg-white flex items-center justify-center font-black text-rose-500 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                {item.room}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">{item.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.time}
                </p>
              </div>
            </div>
            <button className="bg-white border border-rose-100 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">
              Check-out
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckOutList;
