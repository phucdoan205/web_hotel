import React from "react";
import { MoreVertical } from "lucide-react";

const StaffTable = () => {
  const staffList = [
    {
      id: "HK001",
      name: "Nguyễn Văn A",
      role: "Lead Room Attendant",
      status: "Đang làm việc",
      statusColor: "text-emerald-500",
      area: "Tầng 1, Tầng 2",
    },
    {
      id: "HK005",
      name: "Trần Thị B",
      role: "Room Attendant",
      status: "Đang nghỉ giải lao",
      statusColor: "text-orange-500",
      area: "Tầng 3",
    },
    {
      id: "HK012",
      name: "Lê Văn C",
      role: "Room Attendant",
      status: "Nghỉ phép",
      statusColor: "text-gray-400",
      area: "-",
    },
    {
      id: "HK015",
      name: "Phạm Minh D",
      role: "Room Attendant",
      status: "Đang làm việc",
      statusColor: "text-emerald-500",
      area: "Khu vực sảnh",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-900 uppercase">
          Danh sách nhân viên
        </h3>
        <button className="text-[10px] font-black text-[#0085FF] uppercase">
          Xem tất cả
        </button>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50/50">
          <tr>
            {[
              "Nhân viên",
              "Chức vụ",
              "Trạng thái",
              "Khu vực phân công",
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
          {staffList.map((staff, i) => (
            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={`https://i.pravatar.cc/150?u=${staff.id}`}
                      alt={staff.name}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">
                      {staff.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      ID: {staff.id}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-[11px] font-bold text-gray-600">
                {staff.role}
              </td>
              <td className="px-8 py-5">
                <span
                  className={`text-[11px] font-black flex items-center gap-2 ${staff.statusColor}`}
                >
                  ● {staff.status}
                </span>
              </td>
              <td className="px-8 py-5 text-[11px] font-bold text-gray-500">
                {staff.area}
              </td>
              <td className="px-8 py-5">
                <button className="text-gray-300 hover:text-gray-900 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
