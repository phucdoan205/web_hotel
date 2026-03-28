import React from "react";
import { Plus, Minus, Edit3 } from "lucide-react";

const InventoryTable = () => {
  const inventory = [
    {
      name: "Bàn chải đánh răng",
      sub: "Loại Eco-friendly",
      code: "AMEN-001",
      unit: "Cái",
      stock: 500,
      status: "Còn hàng",
      statusColor: "bg-emerald-50 text-emerald-500",
      location: "Khu A - Kệ 1",
    },
    {
      name: "Dầu gội 30ml",
      sub: "Hương bạc hà",
      code: "AMEN-002",
      unit: "Chai",
      stock: 50,
      status: "Sắp hết",
      statusColor: "bg-orange-50 text-orange-500",
      location: "Khu A - Kệ 2",
    },
    {
      name: "Xà bông cục",
      sub: "Gói 15g",
      code: "AMEN-003",
      unit: "Viên",
      stock: 0,
      status: "Hết hàng",
      statusColor: "bg-rose-50 text-rose-500",
      location: "Khu A - Kệ 1",
    },
    {
      name: "Dép đi trong phòng",
      sub: "Màu trắng - Một size",
      code: "AMEN-004",
      unit: "Đôi",
      stock: 320,
      status: "Còn hàng",
      statusColor: "bg-emerald-50 text-emerald-500",
      location: "Khu B - Kệ 5",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {[
              "Tên vật tư",
              "Mã SKU",
              "ĐVT",
              "Tồn kho",
              "Trạng thái",
              "Vị trí",
              "Hành động",
            ].map((h) => (
              <th
                key={h}
                className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inventory.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-orange-100 rounded-xl flex items-center justify-center text-xs">
                    📦
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-[10px] font-bold text-gray-500 tracking-tighter">
                {item.code}
              </td>
              <td className="px-8 py-5 text-xs font-bold text-gray-500">
                {item.unit}
              </td>
              <td className="px-8 py-5 text-xs font-black text-gray-900">
                {item.stock}
              </td>
              <td className="px-8 py-5">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.statusColor}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">
                {item.location}
              </td>
              <td className="px-8 py-5">
                <div className="flex gap-2">
                  <button className="p-1.5 bg-blue-50 text-[#0085FF] rounded-lg hover:bg-[#0085FF] hover:text-white transition-all">
                    <Plus size={14} />
                  </button>
                  <button className="p-1.5 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all">
                    <Minus size={14} />
                  </button>
                  <button className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-900 hover:text-white transition-all">
                    <Edit3 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Hiển thị 1-10 trên 1,250 vật tư
        </p>
        <div className="flex gap-2">
          <button className="size-8 rounded-lg bg-[#0085FF] text-white text-xs font-black shadow-lg shadow-blue-100">
            1
          </button>
          <button className="size-8 rounded-lg text-gray-400 text-xs font-black hover:bg-gray-50">
            2
          </button>
          <button className="size-8 rounded-lg text-gray-400 text-xs font-black hover:bg-gray-50">
            ...
          </button>
          <button className="size-8 rounded-lg text-gray-400 text-xs font-black hover:bg-gray-50">
            125
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
