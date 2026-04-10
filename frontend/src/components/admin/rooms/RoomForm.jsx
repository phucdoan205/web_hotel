import { LoaderCircle, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { roomsApi } from "../../../api/admin/roomsApi";

const text = {
  saveError: "Kh\u00f4ng th\u1ec3 l\u01b0u ph\u00f2ng.",
  cloneSourceRequired: "Vui l\u00f2ng ch\u1ecdn ph\u00f2ng ngu\u1ed3n \u0111\u1ec3 clone.",
  titleCreate: "Th\u00eam ph\u00f2ng m\u1edbi",
  titleUpdate: "C\u1eadp nh\u1eadt ph\u00f2ng",
  subtitleCreate:
    "T\u1ea1o ph\u00f2ng m\u1edbi b\u1eb1ng c\u00e1ch nh\u1eadp tay ho\u1eb7c clone t\u1eeb ph\u00f2ng c\u00f3 s\u1eb5n.",
  subtitleUpdate: "C\u1eadp nh\u1eadt th\u00f4ng tin v\u1eadn h\u00e0nh c\u01a1 b\u1ea3n c\u1ee7a ph\u00f2ng.",
  createMode: "C\u00e1ch t\u1ea1o ph\u00f2ng",
  manual: "Nh\u1eadp th\u1ee7 c\u00f4ng",
  manualDesc:
    "T\u1ef1 ch\u1ecdn lo\u1ea1i ph\u00f2ng, t\u1ea7ng v\u00e0 tr\u1ea1ng th\u00e1i d\u1ecdn ph\u00f2ng ban \u0111\u1ea7u.",
  clone: "Clone ph\u00f2ng",
  cloneDesc: "Sao ch\u00e9p lo\u1ea1i ph\u00f2ng, t\u1ea7ng v\u00e0 v\u1eadt t\u01b0 t\u1eeb ph\u00f2ng ngu\u1ed3n.",
  roomNumber: "S\u1ed1 ph\u00f2ng",
  sourceRoom: "Ph\u00f2ng ngu\u1ed3n",
  sourceRoomPlaceholder: "Ch\u1ecdn ph\u00f2ng \u0111\u1ec3 clone",
  roomType: "Lo\u1ea1i ph\u00f2ng",
  roomTypePlaceholder: "Ch\u1ecdn lo\u1ea1i ph\u00f2ng",
  cloneInfo:
    "Ph\u00f2ng m\u1edbi s\u1ebd k\u1ebf th\u1eeba lo\u1ea1i ph\u00f2ng, t\u1ea7ng v\u00e0 v\u1eadt t\u01b0 t\u1eeb ph\u00f2ng ngu\u1ed3n. Tr\u1ea1ng th\u00e1i ph\u00f2ng s\u1ebd m\u1eb7c \u0111\u1ecbnh l\u00e0 Available.",
  floor: "T\u1ea7ng",
  roomStatus: "Tr\u1ea1ng th\u00e1i ph\u00f2ng",
  cleaningStatus: "Tr\u1ea1ng th\u00e1i d\u1ecdn ph\u00f2ng",
  cancel: "H\u1ee7y",
  save: "L\u01b0u thay \u0111\u1ed5i",
  create: "T\u1ea1o ph\u00f2ng",
};

const createFormState = (initialData) => ({
  mode: "manual",
  cloneSourceRoomId: "",
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
  rooms = [],
  onClose,
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => createFormState(initialData));
  const [submitError, setSubmitError] = useState("");

  const { data: cloneRoomsResponse } = useQuery({
    queryKey: ["room-form-clone-sources"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 200 }),
    enabled: open && !initialData?.id,
  });

  const availableCloneRooms = cloneRoomsResponse?.items?.length
    ? cloneRoomsResponse.items
    : rooms;

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (initialData?.id) {
        return roomsApi.updateRoom(initialData.id, payload);
      }

      if (payload.mode === "clone") {
        return roomsApi.cloneRoom(payload.cloneSourceRoomId, {
          newRoomNumber: payload.roomNumber,
          cleaningStatus: payload.cleaningStatus,
        });
      }

      return roomsApi.createRoom(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSubmitError("");
      onClose();
    },
    onError: (error) => {
      setSubmitError(error.response?.data?.message ?? error.message ?? text.saveError);
    },
  });

  if (!open) return null;

  const isCloneMode = !initialData && form.mode === "clone";

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError("");

    if (isCloneMode) {
      if (!form.cloneSourceRoomId) {
        setSubmitError(text.cloneSourceRequired);
        return;
      }

      saveMutation.mutate({
        mode: "clone",
        cloneSourceRoomId: Number(form.cloneSourceRoomId),
        roomNumber: form.roomNumber.trim(),
        cleaningStatus: form.cleaningStatus,
      });
      return;
    }

    saveMutation.mutate({
      roomNumber: form.roomNumber.trim(),
      roomTypeId: form.roomTypeId ? Number(form.roomTypeId) : null,
      floor: form.floor === "" ? null : Number(form.floor),
      status: form.status,
      cleaningStatus: form.cleaningStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {initialData ? text.titleUpdate : text.titleCreate}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {initialData ? text.subtitleUpdate : text.subtitleCreate}
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-8 py-6">
            {!initialData ? (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {text.createMode}
                </span>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        mode: "manual",
                        cloneSourceRoomId: "",
                        status: "Available",
                      }))
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      form.mode === "manual"
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div className="text-sm font-black uppercase tracking-wide">{text.manual}</div>
                    <p className="mt-1 text-sm font-medium">{text.manualDesc}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        mode: "clone",
                        roomTypeId: "",
                        floor: "",
                        status: "Available",
                        cleaningStatus: "Dirty",
                      }))
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      form.mode === "clone"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div className="text-sm font-black uppercase tracking-wide">{text.clone}</div>
                    <p className="mt-1 text-sm font-medium">{text.cloneDesc}</p>
                  </button>
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {submitError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {text.roomNumber}
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

              {isCloneMode ? (
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {text.sourceRoom}
                  </span>
                  <select
                    value={form.cloneSourceRoomId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        cloneSourceRoomId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-emerald-300 focus:bg-white"
                  >
                    <option value="">{text.sourceRoomPlaceholder}</option>
                    {availableCloneRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomNumber}
                        {room.roomTypeName ? ` - ${room.roomTypeName}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {text.roomType}
                  </span>
                  <select
                    value={form.roomTypeId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, roomTypeId: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                  >
                    <option value="">{text.roomTypePlaceholder}</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {isCloneMode ? (
                <>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 md:col-span-2">
                    {text.cloneInfo}
                  </div>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {text.cleaningStatus}
                    </span>
                    <select
                      value={form.cleaningStatus}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          cleaningStatus: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-emerald-300 focus:bg-white"
                    >
                      <option value="Dirty">Dirty</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Clean">Clean</option>
                      <option value="Inspected">Inspected</option>
                      <option value="Pickup">Pickup</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {text.floor}
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

                  {initialData ? (
                    <label className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {text.roomStatus}
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
                  ) : null}

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {text.cleaningStatus}
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
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {initialData ? text.save : isCloneMode ? text.clone : text.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
