import React from "react";
import { Pencil, Trash2, Utensils, MapPin, Tag, Archive } from "lucide-react";

const CategoryTable = () => {
  const categories = [
    {
      name: "Ẩm thực & Nhà hàng",
      desc: "Giới thiệu về các món ăn đặc sắc và không gian...",
      count: 12,
      status: "Hiển thị",
      icon: <Utensils size={16} />,
      color: "blue",
    },
    {
      name: "Du lịch địa phương",
      desc: "Hướng dẫn tham quan các địa danh nổi tiếng...",
      count: 28,
      status: "Hiển thị",
      icon: <MapPin size={16} />,
      color: "orange",
    },
    {
      name: "Ưu đãi độc quyền",
      desc: "Tổng hợp các chương trình khuyến mãi và quà...",
      count: 5,
      status: "Hiển thị",
      icon: <Tag size={16} />,
      color: "purple",
    },
    {
      name: "Lưu trữ cũ",
      desc: "Các bài viết không còn hoạt động từ năm 202...",
      count: 42,
      status: "Đang ẩn",
      icon: <Archive size={16} />,
      color: "gray",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
            <th className="px-8 py-5">Tên danh mục</th>
            <th className="px-6 py-5">Mô tả ngắn</th>
            <th className="px-6 py-5 text-center">Số lượng</th>
            <th className="px-6 py-5 text-center">Trạng thái</th>
            <th className="px-8 py-5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.map((cat, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`size-10 rounded-xl bg-${cat.color}-50 text-${cat.color}-500 flex items-center justify-center`}
                  >
                    {cat.icon}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    {cat.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 text-xs text-gray-400 max-w-xs truncate">
                {cat.desc}
              </td>
              <td className="px-6 py-5 text-center font-bold text-gray-700 text-sm">
                {cat.count}
              </td>
              <td className="px-6 py-5 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${cat.status === "Hiển thị" ? "bg-emerald-50 text-emerald-500" : "bg-gray-100 text-gray-400"}`}
                >
                  • {cat.status}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
