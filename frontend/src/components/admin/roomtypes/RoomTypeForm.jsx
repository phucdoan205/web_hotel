import { ImagePlus, LoaderCircle, Trash2, UploadCloud, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";

const createRoomTypeFormState = (initialData) => ({
  name: initialData?.name ?? "",
  basePrice: initialData?.basePrice ?? "",
  capacityAdults: initialData?.capacityAdults ?? "",
  capacityChildren: initialData?.capacityChildren ?? "",
  size: initialData?.size ?? "",
  bedType: initialData?.bedType ?? "",
  description: initialData?.description ?? "",
  imageUrls: initialData?.imageUrls ?? [],
});

export default function RoomTypeForm({ open, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => createRoomTypeFormState(initialData));
  const [uploadError, setUploadError] = useState("");

  const uploadMutation = useMutation({
    mutationFn: ({ file, roomTypeName }) =>
      roomTypesApi.uploadRoomTypeImage({ file, roomTypeName }),
    onSuccess: (data) => {
      setForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.includes(data.url)
          ? prev.imageUrls
          : [...prev.imageUrls, data.url],
      }));
      setUploadError("");
    },
    onError: (error) => {
      setUploadError(
        error.response?.data?.message ?? "Upload ảnh loại phòng thất bại.",
      );
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {initialData ? "Cập nhật loại phòng" : "Thêm loại phòng"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              name: form.name.trim(),
              basePrice: Number(form.basePrice) || 0,
              capacityAdults: Number(form.capacityAdults) || 0,
              capacityChildren: Number(form.capacityChildren) || 0,
              size: form.size === "" ? null : Number(form.size),
              bedType: form.bedType.trim(),
              description: form.description.trim(),
              imageUrls: form.imageUrls,
            });
          }}
          className="max-h-[calc(92vh-96px)] overflow-y-auto"
        >
          <div className="grid gap-8 px-8 py-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Tên loại phòng
                </span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Giá cơ bản
                </span>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, basePrice: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Diện tích
                </span>
                <input
                  type="number"
                  value={form.size}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, size: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Người lớn
                </span>
                <input
                  type="number"
                  value={form.capacityAdults}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      capacityAdults: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Trẻ em
                </span>
                <input
                  type="number"
                  value={form.capacityChildren}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      capacityChildren: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Loại giường
                </span>
                <input
                  value={form.bedType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, bedType: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Mô tả
                </span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-black text-slate-900">Ảnh loại phòng</h3>

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
                          roomTypeName: form.name || initialData?.name || "general",
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
                  Ảnh đang dùng ({form.imageUrls.length})
                </p>

                {form.imageUrls.length === 0 ? (
                  <div className="flex min-h-40 items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white text-center">
                    <div className="space-y-2 px-6">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <ImagePlus className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        Chưa có ảnh nào cho loại phòng này.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {form.imageUrls.map((url) => (
                      <div
                        key={url}
                        className="group relative overflow-hidden rounded-[24px] bg-white ring-1 ring-slate-200"
                      >
                        <img src={url} alt="Room Type" className="h-40 w-full object-cover" />
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

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
            >
              {initialData ? "Lưu thay đổi" : "Tạo loại phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
