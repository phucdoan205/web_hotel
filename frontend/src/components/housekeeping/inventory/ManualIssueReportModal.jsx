import { LoaderCircle, Search, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { housekeepingApi } from "../../../api/housekeeping/housekeepingApi";
import { roomInventoriesApi } from "../../../api/admin/roomInventoriesApi";

export default function ManualIssueReportModal({
  open,
  isPending,
  onClose,
  onSubmit,
}) {
  const [roomId, setRoomId] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [roomInventoryId, setRoomInventoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const { data: roomsResponse, isLoading: isRoomsLoading } = useQuery({
    queryKey: ["housekeepingTasks", "manual-report-rooms"],
    queryFn: () => housekeepingApi.getTasks(),
    enabled: open,
  });

  const { data: inventoryItems = [], isLoading: isInventoryLoading } = useQuery({
    queryKey: ["manualReportInventory", roomId],
    queryFn: () => roomInventoriesApi.getInventoryByRoom(roomId),
    enabled: open && Boolean(roomId),
  });

  useEffect(() => {
    if (!open) {
      setRoomId("");
      setRoomSearch("");
      setRoomInventoryId("");
      setQuantity(1);
      setDescription("");
      setImageFile(null);
    }
  }, [open]);

  const rooms = roomsResponse?.items ?? [];
  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return rooms;
    const normalized = roomSearch.trim().toLowerCase();
    return rooms.filter((room) =>
      `${room.roomNumber} ${room.roomTypeName || ""}`.toLowerCase().includes(normalized),
    );
  }, [roomSearch, rooms]);

  const selectedItem = useMemo(
    () => inventoryItems.find((item) => String(item.id) === String(roomInventoryId)) ?? null,
    [inventoryItems, roomInventoryId],
  );

  const maxQuantity = Number(selectedItem?.quantity ?? 0);
  const unitPenalty = Number(selectedItem?.priceIfLost ?? 0);
  const totalPenalty = Number(quantity || 0) * unitPenalty;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Thêm báo cáo hư hỏng / thất thoát</h2>
            <p className="mt-1 text-sm font-bold text-gray-500">
              Chọn phòng và vật tư để ghi nhận mất hoặc hư hỏng ngay tại trang tổng hợp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-2xl p-3 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              roomInventoryId: Number(roomInventoryId),
              quantity: Number(quantity),
              description: description.trim(),
              imageFile,
            });
          }}
          className="space-y-6 px-8 py-6"
        >
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3 rounded-[24px] border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Chọn phòng</p>
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
                <input
                  value={roomSearch}
                  onChange={(event) => setRoomSearch(event.target.value)}
                  placeholder="Tìm phòng..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300"
                />
              </label>

              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {isRoomsLoading ? (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-500">
                    Đang tải danh sách phòng...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-500">
                    Không có phòng phù hợp.
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <button
                      key={room.roomId}
                      type="button"
                      onClick={() => {
                        setRoomId(String(room.roomId));
                        setRoomInventoryId("");
                        setQuantity(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all ${
                        String(roomId) === String(room.roomId)
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-sm font-black">Phòng {room.roomNumber}</span>
                      <span className="text-xs font-bold opacity-80">{room.roomTypeName || "-"}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-[24px] border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Vật tư trong phòng</p>
              <select
                value={roomInventoryId}
                onChange={(event) => {
                  setRoomInventoryId(event.target.value);
                  setQuantity(1);
                }}
                disabled={!roomId || isInventoryLoading}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {!roomId
                    ? "Chọn phòng trước"
                    : isInventoryLoading
                      ? "Đang tải vật tư..."
                      : "Chọn vật tư"}
                </option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {(item.equipmentName || item.itemType) ?? "Vật tư"} - SL {item.quantity ?? 0}
                  </option>
                ))}
              </select>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Số lượng báo cáo
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, maxQuantity)}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    disabled={!selectedItem}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300 disabled:bg-gray-100"
                  />
                </label>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-500">Tổng đền bù</p>
                  <p className="mt-2 text-xl font-black text-amber-700">
                    {totalPenalty.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>

              {selectedItem ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
                  <p>Vật tư: <span className="font-black">{selectedItem.equipmentName || selectedItem.itemType}</span></p>
                  <p>Còn trong phòng: <span className="font-black">{maxQuantity}</span></p>
                  <p>Đơn giá đền bù: <span className="font-black">{unitPenalty.toLocaleString("vi-VN")} đ</span></p>
                </div>
              ) : null}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Mô tả</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả tình trạng hư hỏng hoặc thất thoát..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white"
            />
          </label>

          <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Ảnh minh chứng</p>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Có thể thêm ảnh để đối soát hư hỏng và đền bù.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition-all hover:bg-blue-700">
                <UploadCloud className="size-4" />
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {imageFile ? (
              <p className="mt-3 text-sm font-semibold text-gray-700">{imageFile.name}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedItem || Number(quantity) <= 0 || Number(quantity) > maxQuantity}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-rose-700 disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
