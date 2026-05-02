import { ChevronLeft, ChevronRight, ImagePlus, MoreHorizontal, Search } from "lucide-react";
import { useState } from "react";

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

const text = {
  listTitle: "Danh s\u00e1ch ph\u00f2ng",
  listDesc: "L\u1ecdc theo s\u1ed1 ph\u00f2ng, lo\u1ea1i ph\u00f2ng, tr\u1ea1ng th\u00e1i, d\u1ecdn ph\u00f2ng v\u00e0 t\u1ea7ng.",
  bulkCreate: "Th\u00eam nhi\u1ec1u ph\u00f2ng",
  create: "Th\u00eam ph\u00f2ng",
  search: "T\u00ecm s\u1ed1 ph\u00f2ng",
  roomType: "Lo\u1ea1i ph\u00f2ng",
  status: "Tr\u1ea1ng th\u00e1i",
  cleaning: "D\u1ecdn ph\u00f2ng",
  floor: "T\u1ea7ng",
  reset: "\u0110\u1eb7t l\u1ea1i",
  image: "\u1ea2nh",
  roomNumber: "S\u1ed1 ph\u00f2ng",
  actions: "H\u00e0nh \u0111\u1ed9ng",
  emptyTitle: "Ch\u01b0a c\u00f3 ph\u00f2ng n\u00e0o hi\u1ec3n th\u1ecb",
  emptyDesc: "Ki\u1ec3m tra l\u1ea1i b\u1ed9 l\u1ecdc ho\u1eb7c th\u00eam ph\u00f2ng m\u1edbi \u0111\u1ec3 b\u1eaft \u0111\u1ea7u.",
  noType: "Ch\u01b0a c\u00f3 lo\u1ea1i",
  edit: "S\u1eeda",
  clean: "D\u1ecdn ph\u00f2ng",
  inventory: "V\u1eadt t\u01b0",
  amenities: "Tiện ích",
  hide: "\u1ea8n ph\u00f2ng",
  restore: "Kh\u00f4i ph\u1ee5c",
  showing: "Hi\u1ec3n th\u1ecb",
  page: "Trang",
  perPage: "/ trang",
};

export default function RoomTable({
  rooms,
  totalCount,
  loading,
  filters,
  roomTypes,
  canCreateRooms = true,
  canEditRooms = true,
  canDeleteRooms = true,
  canUpdateRoomStatus = true,
  canViewInventory = true,
  onFilterChange,
  onResetFilters,
  onCreate,
  onEdit,
  onBulkCreate,
  onDelete,
  onRestore,
  onOpenInventory,
  onOpenAmenities,
  onClean,
}) {
  const [menuRoomId, setMenuRoomId] = useState(null);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / filters.pageSize));

  const toggleMenu = (roomId) => {
    setMenuRoomId((prev) => (prev === roomId ? null : roomId));
  };

  const closeMenu = () => setMenuRoomId(null);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {text.listTitle} ({totalCount})
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{text.listDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-[430px] lg:justify-end">
            {canCreateRooms ? (
              <>
                <button
                  type="button"
                  onClick={onBulkCreate}
                  className="min-w-[180px] rounded-2xl border border-sky-200 px-5 py-3 text-sm font-black uppercase tracking-wide text-sky-700 transition-all hover:bg-sky-50"
                >
                  {text.bulkCreate}
                </button>
                <button
                  type="button"
                  onClick={onCreate}
                  className="min-w-[150px] rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
                >
                  {text.create}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_0.9fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => onFilterChange("search", event.target.value)}
              placeholder={text.search}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
            />
          </div>

          <select
            value={filters.roomTypeId}
            onChange={(event) => onFilterChange("roomTypeId", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          >
            <option value="">{text.roomType}</option>
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
            <option value="">{text.status}</option>
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
            <option value="">{text.cleaning}</option>
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
            placeholder={text.floor}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
          />

          <button
            type="button"
            onClick={onResetFilters}
            className="px-2 text-sm font-black uppercase tracking-wide text-sky-600 transition-all hover:text-sky-800"
          >
            {text.reset}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.image}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.roomNumber}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.roomType}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.floor}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.status}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.cleaning}
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                  {text.actions}
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
                    <td className="px-6 py-4"><div className="h-10 w-28 animate-pulse rounded-2xl bg-slate-100" /></td>
                  </tr>
                ))
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                        <ImagePlus className="size-6" />
                      </div>
                      <p className="text-lg font-black text-slate-900">{text.emptyTitle}</p>
                      <p className="text-sm font-medium text-slate-500">{text.emptyDesc}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const isMenuOpen = menuRoomId === room.id;

                  return (
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
                        {room.roomTypeName || text.noType}
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
                        <div className="relative flex items-center gap-2">
                          {canEditRooms ? (
                            <button
                              type="button"
                              onClick={() => {
                                closeMenu();
                                onEdit(room);
                              }}
                              className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 transition-all hover:bg-sky-100"
                            >
                              {text.edit}
                            </button>
                          ) : null}

                          {canUpdateRoomStatus || canViewInventory || canDeleteRooms ? (
                            <button
                              type="button"
                              onClick={() => toggleMenu(room.id)}
                              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-slate-700 transition-all hover:bg-slate-200"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                          ) : null}

                          {isMenuOpen ? (
                            <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                              {canUpdateRoomStatus ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    closeMenu();
                                    onClean(room);
                                  }}
                                  className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-amber-700 transition-all hover:bg-amber-50"
                                >
                                  {text.clean}
                                </button>
                              ) : null}
                              {canViewInventory ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    closeMenu();
                                    onOpenInventory(room);
                                  }}
                                  className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-violet-700 transition-all hover:bg-violet-50"
                                >
                                  {text.inventory}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => {
                                  closeMenu();
                                  onOpenAmenities(room);
                                }}
                                className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-sky-700 transition-all hover:bg-sky-50"
                              >
                                {text.amenities}
                              </button>
                              {canDeleteRooms ? (
                                room.status === "OutOfOrder" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu();
                                      onRestore(room);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50"
                                  >
                                    {text.restore}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu();
                                      onDelete(room);
                                    }}
                                    className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-700 transition-all hover:bg-rose-50"
                                  >
                                    {text.hide}
                                  </button>
                                )
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold text-slate-500">
            {text.showing} {rooms.length} / {totalCount} ph\u00f2ng
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.pageSize}
              onChange={(event) => onFilterChange("pageSize", Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} {text.perPage}
                </option>
              ))}
            </select>

            <div className="text-sm font-black text-slate-700">
              {text.page} {filters.page} / {totalPages}
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
