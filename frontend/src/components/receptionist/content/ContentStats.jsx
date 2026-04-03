import React from "react";
import { FileText, Layers, Eye, ShieldCheck, Archive } from "lucide-react";

const ContentStats = ({ activeTab }) => {
  // Dữ liệu thay đổi dựa trên Tab hiện tại
  const stats =
    activeTab === "posts"
      ? [
          {
            label: "Tổng bài viết",
            value: "45",
            icon: <FileText size={20} />,
            color: "text-blue-500",
            bg: "bg-blue-50",
            trend: "+ 5 tháng này",
          },
          {
            label: "Danh mục hoạt động",
            value: "12",
            icon: <Layers size={20} />,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Lượt xem bài viết",
            value: "1.2k",
            icon: <Eye size={20} />,
            color: "text-gray-500",
            bg: "bg-gray-50",
          },
        ]
      : [
          {
            label: "Tổng danh mục",
            value: "12",
            icon: <Layers size={20} />,
            color: "text-blue-500",
            bg: "bg-blue-50",
            trend: "+ 2 tháng này",
          },
          {
            label: "Đang hiển thị",
            value: "9",
            icon: <ShieldCheck size={20} />,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Trong kho lưu trữ",
            value: "3",
            icon: <Archive size={20} />,
            color: "text-gray-500",
            bg: "bg-gray-50",
          },
        ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {stat.value}
              </p>
              {stat.trend && (
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentStats;
