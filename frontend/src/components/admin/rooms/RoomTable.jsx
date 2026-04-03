import { ChevronLeft, ChevronRight, ImagePlus, Search } from "lucide-react";

const statuses = ["Available", "Occupied", "Maintenance", "Cleaning", "OutOfOrder"];
const cleaningStatuses = ["Dirty", "InProgress", "Clean", "Inspected", "Pickup"];

const getBadgeClass = (value) => {
  switch (value) {
    case "Available":
    case "Clean":
    case "Inspected":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "Occupied":
    case "InProgress":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "Maintenance":
    case "OutOfOrder":
    case "Dirty":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
};

export default function RoomTable({
  rooms,
  totalCount,
  loading,
  filters,
  roomTypes,
  onFilterChange,
  onResetFilters,
  onCreate,
  onEdit,
  onBulkCreate,
  onDelete,
  onRestore,
  onOpenInventory,
  onClean,
  onClone,
}) {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / filters.pageSize));

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Danh sách phòng ({totalCount})
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Lọc theo số phòng, loại phòng, trạng thái, dọn phòng và tầng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-[430px] lg:justify-end">
            <button
              type="button"
              onClick={onBulkCreate}
              className="min-w-[180px] rounded-2xl border border-sky-200 px-5 py-3 text-sm font-black uppercase tracking-wide text-sky-700 transition-all hover:bg-sky-50"
            >
              Thêm nhiều phòng
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="min-w-[150px] rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
            >
              Thêm phòng
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_0.9fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => onFilterChange("search", event.target.value)}
              placeholder="Tìm số phòng"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
            />
          </div>

          <select
            value={filters.roomTypeId}
            onChange={(event) => onFilterChange("roomTypeId", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          >
            <option value="">Loại phòng</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          >
            <option value="">Trạng thái</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filters.cleaningStatus}
            onChange={(event) => onFilterChange("cleaningStatus", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          >
            <option value="">Dọn phòng</option>
            {cleaningStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={filters.floor}
            onChange={(event) => onFilterChange("floor", event.target.value)}
            placeholder="Tầng"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          />

          <button
            type="button"
            onClick={onResetFilters}
            className="px-2 text-sm font-black uppercase tracking-wide text-sky-600 transition-all hover:text-sky-800"
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Ảnh
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Số phòng
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Loại phòng
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Tầng
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Dọn phòng
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-12 w-16 animate-pulse rounded-2xl bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-16 animate-pulse rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-10 animate-pulse rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-3 w-40 animate-pulse rounded-full bg-slate-100" /></td>
                  </tr>
                ))
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                        <ImagePlus className="size-6" />
                      </div>
                      <p className="text-lg font-black text-slate-900">
                        Chưa có phòng nào hiển thị
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        Kiểm tra lại bộ lọc hoặc thêm phòng mới để bắt đầu.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      {room.imageUrls?.[0] ? (
                        <img
                          src={room.imageUrls[0]}
                          alt={room.roomNumber}
                          className="h-12 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ImagePlus className="size-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">{room.roomNumber}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {room.roomTypeName || "Chưa có loại"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{room.floor ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getBadgeClass(room.status)}`}>
                        {room.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getBadgeClass(room.cleaningStatus)}`}>
                        {room.cleaningStatus || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => onEdit(room)} className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition-all hover:bg-sky-100">Sửa</button>
                        <button type="button" onClick={() => onClean(room)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition-all hover:bg-amber-100">Dọn phòng</button>
                        <button type="button" onClick={() => onOpenInventory(room)} className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 transition-all hover:bg-violet-100">Vật tư</button>
                        <button type="button" onClick={() => onClone(room)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:bg-emerald-100">Clone</button>
                        {room.status === "OutOfOrder" ? (
                          <button type="button" onClick={() => onRestore(room)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:bg-emerald-100">Khôi phục</button>
                        ) : (
                          <button type="button" onClick={() => onDelete(room)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition-all hover:bg-rose-100">Xóa</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-slate-500">
            Hiển thị {rooms.length} / {totalCount} phòng
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.pageSize}
              onChange={(event) => onFilterChange("pageSize", Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>

            <div className="text-sm font-black text-slate-700">
              Trang {filters.page} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => onFilterChange("page", Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("page", Math.min(totalPages, filters.page + 1))}
              disabled={filters.page >= totalPages}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
