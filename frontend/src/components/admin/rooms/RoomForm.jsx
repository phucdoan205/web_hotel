import { ImagePlus, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { roomsApi } from "../../../api/admin/roomsApi";

const createFormState = (initialData) => ({
  roomNumber: initialData?.roomNumber ?? "",
  roomTypeId: initialData?.roomTypeId ?? "",
  floor: initialData?.floor ?? "",
  status: initialData?.status ?? "Available",
  cleaningStatus: initialData?.cleaningStatus ?? "Dirty",
  imageUrls: initialData?.imageUrls ?? [],
});

export default function RoomForm({
  open,
  initialData,
  roomTypes = [],
  onClose,
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => createFormState(initialData));
  const [uploadError, setUploadError] = useState("");

  const { data: imageLibrary = [] } = useQuery({
    queryKey: ["roomImageLibrary"],
    queryFn: () => roomsApi.getImageLibrary(),
    enabled: open,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      initialData?.id
        ? roomsApi.updateRoom(initialData.id, payload)
        : roomsApi.createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomImageLibrary"] });
      onClose();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, roomName }) => roomsApi.uploadRoomImage({ file, roomName }),
    onSuccess: (data) => {
      setForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.includes(data.url)
          ? prev.imageUrls
          : [...prev.imageUrls, data.url],
      }));
      queryClient.invalidateQueries({ queryKey: ["roomImageLibrary"] });
      setUploadError("");
    },
    onError: (error) => {
      setUploadError(error.response?.data?.message ?? "Upload ảnh thất bại.");
    },
  });

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    saveMutation.mutate({
      roomNumber: form.roomNumber.trim(),
      roomTypeId: form.roomTypeId ? Number(form.roomTypeId) : null,
      floor: form.floor === "" ? null : Number(form.floor),
      status: form.status,
      cleaningStatus: form.cleaningStatus,
      imageUrls: form.imageUrls,
    });
  };

  const toggleLibraryImage = (url) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.includes(url)
        ? prev.imageUrls.filter((item) => item !== url)
        : [...prev.imageUrls, url],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {initialData ? "Cập nhật phòng" : "Thêm phòng mới"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Upload ảnh lên Cloudinary theo thư mục tên phòng và chọn ảnh có sẵn nếu muốn.
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

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-96px)] overflow-y-auto">
          <div className="grid gap-8 px-8 py-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <label className="space-y-2">
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

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Ảnh phòng</h3>
                    <p className="text-sm font-medium text-slate-500">
                      Cloudinary folder:
                      {" "}
                      <span className="font-black text-slate-700">
                        home/RoomImage/{form.roomNumber || "ten-phong"}
                      </span>
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700">
                    {uploadMutation.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <UploadCloud className="size-4" />
                    )}
                    Tải ảnh lên
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (event) => {
                        const files = Array.from(event.target.files || []);
                        for (const file of files) {
                          await uploadMutation.mutateAsync({
                            file,
                            roomName: form.roomNumber || initialData?.roomNumber || "general",
                          });
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {uploadError ? (
                  <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {uploadError}
                  </div>
                ) : null}

                <div className="mt-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Ảnh đã chọn ({form.imageUrls.length})
                  </p>

                  {form.imageUrls.length === 0 ? (
                    <div className="flex min-h-32 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-center">
                      <div className="space-y-2 px-6">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <ImagePlus className="size-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">
                          Chưa có ảnh nào được chọn cho phòng này.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {form.imageUrls.map((url) => (
                        <div key={url} className="group relative overflow-hidden rounded-[24px] bg-white ring-1 ring-slate-200">
                          <img src={url} alt="Room" className="h-40 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                imageUrls: prev.imageUrls.filter((item) => item !== url),
                              }))
                            }
                            className="absolute right-3 top-3 rounded-xl bg-white/90 p-2 text-rose-600 opacity-0 shadow transition-all group-hover:opacity-100"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-black text-slate-900">Dùng lại ảnh có sẵn</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Có thể chọn ảnh đã dùng ở phòng khác để gắn cho phòng hiện tại.
              </p>

              <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {imageLibrary.length === 0 ? (
                  <div className="col-span-full rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm font-semibold text-slate-500">
                    Chưa có ảnh phòng nào trong thư viện.
                  </div>
                ) : (
                  imageLibrary.map((url) => {
                    const selected = form.imageUrls.includes(url);

                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => toggleLibraryImage(url)}
                        className={`overflow-hidden rounded-[24px] border text-left transition-all ${
                          selected
                            ? "border-orange-400 ring-2 ring-orange-200"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img src={url} alt="Library" className="h-32 w-full object-cover" />
                        <div className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                            selected
                              ? "bg-orange-50 text-orange-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {selected ? "Đã chọn" : "Chọn ảnh này"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
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
