import React from "react";

const MaterialUsageTable = () => {
  const materials = [
    {
      name: "Bộ drap giường King",
      qty: "45 bộ",
      cost: "11,250,000",
      date: "24/05/2024",
      status: "Đã nhận",
      sColor: "bg-emerald-50 text-emerald-500",
    },
    {
      name: "Dầu gội & Sữa tắm (Mini)",
      qty: "250 set",
      cost: "2,500,000",
      date: "23/05/2024",
      status: "Đã nhận",
      sColor: "bg-emerald-50 text-emerald-500",
    },
    {
      name: "Khăn tắm cao cấp",
      qty: "60 chiếc",
      cost: "5,400,000",
      date: "22/05/2024",
      status: "Đang giao",
      sColor: "bg-orange-50 text-orange-500",
    },
    {
      name: "Dung dịch tẩy rửa đa năng",
      qty: "12 chai",
      cost: "1,080,000",
      date: "21/05/2024",
      status: "Hết hàng",
      sColor: "bg-rose-50 text-rose-500",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
          <span className="size-5 bg-blue-500 rounded text-white flex items-center justify-center text-[10px]">
            📑
          </span>
          Chi tiết sử dụng vật tư
        </h3>
        <button className="text-[10px] font-black text-[#0085FF] uppercase">
          Xuất báo cáo (CSV)
        </button>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr>
            {[
              "Tên vật tư",
              "Số lượng",
              "Chi phí (VNĐ)",
              "Ngày cập nhật",
              "Trạng thái",
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
          {materials.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5 text-xs font-black text-gray-900">
                {item.name}
              </td>
              <td className="px-8 py-5 text-xs font-bold text-gray-600">
                {item.qty}
              </td>
              <td className="px-8 py-5 text-xs font-black text-gray-900">
                {item.cost}
              </td>
              <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">
                {item.date}
              </td>
              <td className="px-8 py-5">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.sColor}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialUsageTable;
