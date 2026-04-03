import { BedDouble, Image as ImageIcon } from "lucide-react";

export default function RoomTypeTable({
  roomTypes,
  isLoading,
  onEdit,
  onDelete,
  onManageAmenities,
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Ảnh
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Tên loại phòng
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Giá
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Sức chứa
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Giường
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Số phòng
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4"><div className="h-14 w-20 animate-pulse rounded-2xl bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-10 animate-pulse rounded-full bg-slate-100" /></td>
                  <td className="px-6 py-4"><div className="h-3 w-40 animate-pulse rounded-full bg-slate-100" /></td>
                </tr>
              ))
            ) : roomTypes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                      <BedDouble className="size-6" />
                    </div>
                    <p className="text-lg font-black text-slate-900">Chưa có loại phòng nào</p>
                    <p className="text-sm font-medium text-slate-500">
                      Hãy thêm loại phòng mới để bắt đầu quản lý ảnh và tiện ích.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              roomTypes.map((roomType) => (
                <tr key={roomType.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    {roomType.primaryImageUrl ? (
                      <img
                        src={roomType.primaryImageUrl}
                        alt={roomType.name}
                        className="h-14 w-20 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900">{roomType.name}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {roomType.description || "Không có mô tả"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">
                    {(roomType.basePrice ?? 0).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {roomType.capacityAdults} người lớn, {roomType.capacityChildren} trẻ em
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {roomType.bedType || "Chưa có"}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">
                    {roomType.roomCount ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => onManageAmenities(roomType)} className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 transition-all hover:bg-violet-100">Tiện ích</button>
                      <button type="button" onClick={() => onEdit(roomType)} className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition-all hover:bg-sky-100">Sửa</button>
                      <button type="button" onClick={() => onDelete(roomType)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition-all hover:bg-rose-100">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
