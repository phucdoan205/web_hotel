import { ImagePlus, LoaderCircle, Trash2, UploadCloud, X, Layout, DollarSign, Users, Maximize, Bed, FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";
import RichTextEditor from "../../shared/RichTextEditor";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl">
        {/* Left Side: Form Content */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 px-10 py-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {initialData ? "Cập nhật loại phòng" : "Tạo loại phòng mới"}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Thiết lập thông tin cơ bản và mô tả chi tiết cho loại phòng.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-5" />
            </button>
          </div>

          <form
            id="room-type-form"
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
            className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide"
          >
            <div className="space-y-10">
              {/* Basic Info Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Layout className="size-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Thông tin cơ bản</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Tên loại phòng
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="VD: Deluxe Ocean View"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Giá cơ bản (VND)
                    </span>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        required
                        value={form.basePrice}
                        onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-11 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Diện tích (m²)
                    </span>
                    <div className="relative">
                      <Maximize className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={form.size}
                        onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-11 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Người lớn tối đa
                    </span>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={form.capacityAdults}
                        onChange={(event) => setForm((prev) => ({ ...prev, capacityAdults: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-11 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                      />
                    </div>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Trẻ em tối đa
                    </span>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={form.capacityChildren}
                        onChange={(event) => setForm((prev) => ({ ...prev, capacityChildren: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-11 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                      />
                    </div>
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                      Cấu hình giường
                    </span>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={form.bedType}
                        onChange={(event) => setForm((prev) => ({ ...prev, bedType: event.target.value }))}
                        placeholder="VD: 1 Giường đôi King Size"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-11 pr-5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
                      />
                    </div>
                  </label>
                </div>
              </section>

              {/* Description Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">Mô tả chi tiết</h3>
                </div>

                <div className="space-y-2">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                    Nội dung mô tả (Hỗ trợ định dạng)
                  </span>
                  <RichTextEditor 
                    value={form.description} 
                    onChange={(val) => setForm(prev => ({ ...prev, description: val }))}
                    placeholder="Viết mô tả chi tiết về tiện nghi, không gian và ưu điểm của loại phòng..."
                  />
                </div>
              </section>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/50 px-10 py-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl px-8 py-3.5 text-sm font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="room-type-form"
              className="rounded-2xl bg-orange-600 px-10 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-200 transition-all hover:bg-orange-700 hover:shadow-orange-300"
            >
              {initialData ? "Lưu thay đổi" : "Khởi tạo loại phòng"}
            </button>
          </div>
        </div>

        {/* Right Side: Media / Image Gallery */}
        <div className="flex w-[400px] flex-col bg-slate-50/50 p-8">
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900">Bộ sưu tập ảnh</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Tải lên các ảnh đẹp nhất của loại phòng này.</p>
          </div>

          <label className="group relative flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white transition-all hover:border-orange-300 hover:bg-orange-50/30">
            {uploadMutation.isPending ? (
              <LoaderCircle className="size-8 animate-spin text-orange-600" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
                <UploadCloud className="size-6" />
              </div>
            )}
            <div className="text-center">
              <span className="block text-sm font-black text-slate-700">Tải ảnh lên</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">JPG, PNG (Max 10MB)</span>
            </div>
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

          {uploadError && (
            <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600 ring-1 ring-rose-100">
              {uploadError}
            </div>
          )}

          <div className="mt-8 flex-1 overflow-y-auto scrollbar-hide">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
              Ảnh hiện tại ({form.imageUrls.length})
            </p>

            {form.imageUrls.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-[2rem] bg-white ring-1 ring-slate-100">
                <ImagePlus className="mb-2 size-8 text-slate-200" />
                <span className="text-xs font-bold text-slate-400">Chưa có ảnh nào</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {form.imageUrls.map((url, idx) => (
                  <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-sm ring-1 ring-slate-200">
                    <img src={url} alt={`Room ${idx}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter(item => item !== url) }))}
                      className="absolute right-3 top-3 rounded-xl bg-white/90 p-2 text-rose-600 shadow-xl transition-transform hover:scale-110"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-orange-600 px-2 py-1 text-[10px] font-black uppercase text-white shadow-lg">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
