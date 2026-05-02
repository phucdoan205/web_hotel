import { BedDouble, Image as ImageIcon, MoreHorizontal, Eye, Edit3, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";

export default function RoomTypeTable({
  roomTypes,
  isLoading,
  canEdit = true,
  canDelete = true,
  canManageAmenities = true,
  onView,
  onEdit,
  onDelete,
  onManageAmenities,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const handleOpenMenu = (event, roomType) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoomType(roomType);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRoomType(null);
  };
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
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => onView?.(roomType)}
                        className="flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-700 transition-all hover:bg-orange-100"
                      >
                        <Eye className="size-4" />
                        <span>Xem</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenMenu(e, roomType)}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-slate-700 transition-all hover:bg-slate-200"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              marginTop: "8px",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              border: "1px solid #e2e8f0",
              minWidth: "180px",
              padding: "4px",
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        {selectedRoomType && (
          <>
            {canEdit && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onEdit(selectedRoomType);
                }}
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0369a1",
                  "&:hover": { backgroundColor: "#f0f9ff" },
                }}
              >
                <ListItemIcon><Edit3 className="size-4 text-sky-600" /></ListItemIcon>
                <ListItemText primary="Sửa" />
              </MenuItem>
            )}
            {canManageAmenities && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onManageAmenities(selectedRoomType);
                }}
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#6d28d9",
                  "&:hover": { backgroundColor: "#f5f3ff" },
                }}
              >
                <ListItemIcon><ShieldCheck className="size-4 text-violet-600" /></ListItemIcon>
                <ListItemText primary="Tiện ích" />
              </MenuItem>
            )}
            {canDelete && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onDelete(selectedRoomType);
                }}
                sx={{
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#be123c",
                  "&:hover": { backgroundColor: "#fff1f2" },
                }}
              >
                <ListItemIcon><Trash2 className="size-4 text-rose-600" /></ListItemIcon>
                <ListItemText primary="Xóa" />
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </div>
  );
}
