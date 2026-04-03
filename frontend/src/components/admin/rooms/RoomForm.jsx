import { LoaderCircle, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { roomsApi } from "../../../api/admin/roomsApi";

const createFormState = (initialData) => ({
  roomNumber: initialData?.roomNumber ?? "",
  roomTypeId: initialData?.roomTypeId ?? "",
  floor: initialData?.floor ?? "",
  status: initialData?.status ?? "Available",
  cleaningStatus: initialData?.cleaningStatus ?? "Dirty",
});

export default function RoomForm({
  open,
  initialData,
  roomTypes = [],
  onClose,
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => createFormState(initialData));

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      initialData?.id
        ? roomsApi.updateRoom(initialData.id, payload)
        : roomsApi.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {initialData ? "Cập nhật phòng" : "Thêm phòng mới"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Cập nhật thông tin vận hành cơ bản của phòng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate({
              roomNumber: form.roomNumber.trim(),
              roomTypeId: form.roomTypeId ? Number(form.roomTypeId) : null,
              floor: form.floor === "" ? null : Number(form.floor),
              status: form.status,
              cleaningStatus: form.cleaningStatus,
            });
          }}
        >
          <div className="grid gap-4 px-8 py-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Số phòng
              </span>
              <input
                required
                value={form.roomNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, roomNumber: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Loại phòng
              </span>
              <select
                value={form.roomTypeId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, roomTypeId: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Tầng
              </span>
              <input
                type="number"
                value={form.floor}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, floor: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Trạng thái phòng
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="OutOfOrder">OutOfOrder</option>
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                Trạng thái dọn phòng
              </span>
              <select
                value={form.cleaningStatus}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    cleaningStatus: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
              >
                <option value="Dirty">Dirty</option>
                <option value="InProgress">InProgress</option>
                <option value="Clean">Clean</option>
                <option value="Inspected">Inspected</option>
                <option value="Pickup">Pickup</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {initialData ? "Lưu thay đổi" : "Tạo phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
