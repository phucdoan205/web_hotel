import React from "react";
import { Check, X } from "lucide-react";

const TaskTable = () => {
  const tasks = [
    {
      id: "301",
      floor: "Tầng 3",
      type: "Sau check-out",
      priority: "KHẨN CẤP",
      time: "45 phút",
      status: "Đang dọn",
      pColor: "text-rose-500 bg-rose-50",
      sColor: "text-orange-500",
    },
    {
      id: "205",
      floor: "Tầng 2",
      type: "Dọn theo yêu cầu",
      priority: "CAO",
      time: "20 phút",
      status: "Chờ dọn",
      pColor: "text-orange-500 bg-orange-50",
      sColor: "text-gray-400",
    },
    {
      id: "412",
      floor: "Tầng 4",
      type: "Dọn định kỳ",
      priority: "THƯỜNG",
      time: "30 phút",
      status: "Hoàn thành",
      pColor: "text-gray-500 bg-gray-100",
      sColor: "text-emerald-500",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            {[
              "Số phòng",
              "Loại dọn dẹp",
              "Ưu tiên",
              "Thời gian dự kiến",
              "Trạng thái",
              "Thao tác",
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
          {tasks.map((task, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5">
                <span className="text-sm font-black text-gray-900">
                  {task.id}
                </span>
                <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">
                  {task.floor}
                </span>
              </td>
              <td className="px-8 py-5 text-xs font-bold text-gray-600">
                {task.type}
              </td>
              <td className="px-8 py-5">
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black ${task.pColor}`}
                >
                  ✦ {task.priority}
                </span>
              </td>
              <td className="px-8 py-5">
                <p className="text-xs font-black text-gray-900">{task.time}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Dự kiến xong: 11:30 AM
                </p>
              </td>
              <td className="px-8 py-5">
                <span className={`text-xs font-black ${task.sColor}`}>
                  ● {task.status}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex gap-2">
                  {task.status === "Hoàn thành" ? (
                    <span className="text-[10px] font-bold text-gray-300 italic">
                      Đã chốt
                    </span>
                  ) : (
                    <>
                      <button className="bg-[#0085FF] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-600 shadow-sm">
                        Bắt đầu
                      </button>
                      <button className="p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Hiển thị 4 trên 45 nhiệm vụ
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-black text-gray-400 hover:text-gray-900">
            Trước
          </button>
          <button className="size-8 rounded-lg bg-[#0085FF] text-white text-xs font-black">
            1
          </button>
          <button className="size-8 rounded-lg text-gray-400 text-xs font-black hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 text-xs font-black text-gray-400 hover:text-gray-900">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTable;
