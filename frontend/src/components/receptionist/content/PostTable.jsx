import React from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const PostTable = () => {
  const posts = [
    {
      title: "Top 10 địa điểm du lịch không thể bỏ qua...",
      category: "Du lịch địa phương",
      date: "20/05/2024",
      status: "Hiển thị",
      color: "orange",
    },
    {
      title: "Trải nghiệm trà chiều sang trọng tại...",
      category: "Ẩm thực & Nhà hàng",
      date: "18/05/2024",
      status: "Hiển thị",
      color: "blue",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
            <th className="px-8 py-5">Tên bài viết</th>
            <th className="px-6 py-5">Danh mục</th>
            <th className="px-6 py-5">Ngày đăng</th>
            <th className="px-6 py-5 text-center">Trạng thái</th>
            <th className="px-8 py-5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {posts.map((post, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={`https://picsum.photos/seed/${i}/100`}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-gray-900 text-sm line-clamp-1">
                    {post.title}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span
                  className={`px-3 py-1 bg-${post.color}-50 text-${post.color}-500 rounded-lg text-[10px] font-bold uppercase`}
                >
                  {post.category}
                </span>
              </td>
              <td className="px-6 py-5 text-xs font-medium text-gray-400">
                {post.date}
              </td>
              <td className="px-6 py-5 text-center">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-tight">
                  • {post.status}
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
      {/* Pagination component logic here */}
    </div>
  );
};

export default PostTable;
