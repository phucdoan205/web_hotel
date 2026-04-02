// src/pages/admin/rooms/RoomTypeTable.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const RoomTypeTable = ({ roomTypes, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 font-semibold">Đang tải danh sách loại phòng...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50/70 border-b border-gray-100">
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-5">Tên loại phòng</th>
              <th className="px-6 py-5">Giá cơ bản</th>
              <th className="px-6 py-5">Sức chứa</th>
              <th className="px-6 py-5">Diện tích</th>
              <th className="px-6 py-5">Loại giường</th>
              <th className="px-6 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {roomTypes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-8 py-16 text-center text-sm font-semibold text-gray-400"
                >
                  Chưa có loại phòng nào. Hãy thêm loại phòng mới.
                </td>
              </tr>
            ) : (
              roomTypes.map((roomType) => (
                <tr
                  key={roomType.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900 text-base">
                      {roomType.name}
                    </div>
                    {roomType.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-md">
                        {roomType.description}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-6">
                    <div className="font-black text-emerald-600 text-lg">
                      {roomType.basePrice.toLocaleString('vi-VN')} ₫
                    </div>
                  </td>

                  <td className="px-6 py-6 text-sm">
                    <span className="font-semibold text-gray-700">
                      {roomType.capacityAdults} người lớn
                    </span>
                    {roomType.capacityChildren > 0 && (
                      <span className="text-gray-500"> • {roomType.capacityChildren} trẻ em</span>
                    )}
                  </td>

                  <td className="px-6 py-6 text-sm font-medium text-gray-600">
                    {roomType.size ? `${roomType.size} m²` : '—'}
                  </td>

                  <td className="px-6 py-6 text-sm text-gray-600">
                    {roomType.bedType || '—'}
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => onEdit(roomType)}
                        className="p-2.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-2xl transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="size-4" />
                      </button>

                      <button
                        onClick={() => onDelete(roomType.id)}
                        className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                        title="Xóa"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs font-bold text-gray-400">
        <p>
          Hiển thị <span className="text-gray-900">{roomTypes.length}</span> loại phòng
        </p>
        <p className="text-[10px] uppercase tracking-widest">Room Type Management</p>
      </div>
    </div>
  );
};

export default RoomTypeTable;