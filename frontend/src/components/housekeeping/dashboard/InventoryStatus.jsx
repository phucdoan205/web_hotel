import React from "react";

const InventoryStatus = () => {
  const items = [
    {
      name: "Xà phòng (Soap)",
      status: "SẮP HẾT HÀNG",
      color: "text-rose-500",
      value: "12/100 cục",
    },
    {
      name: "Khăn tắm (Towels)",
      status: "ĐỦ DÙNG",
      color: "text-emerald-500",
      value: "85/120 chiếc",
    },
    {
      name: "Nước suối (Water)",
      status: "TRUNG BÌNH",
      color: "text-orange-500",
      value: "45/150 chai",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="size-5 bg-[#0085FF] rounded-md" />
        <h3 className="text-sm font-black text-gray-900 uppercase">
          Tình trạng vật tư
        </h3>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div>
              <p className="text-xs font-black text-gray-800">{item.name}</p>
              <p
                className={`text-[9px] font-black uppercase mt-1 ${item.color}`}
              >
                {item.status}
              </p>
            </div>
            <p className="text-[11px] font-bold text-gray-400">{item.value}</p>
          </div>
        ))}
      </div>
      <button className="w-full mt-8 py-3 border-2 border-dashed border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:border-[#0085FF] hover:text-[#0085FF] transition-all uppercase">
        Yêu cầu kho
      </button>
    </div>
  );
};

export default InventoryStatus;
