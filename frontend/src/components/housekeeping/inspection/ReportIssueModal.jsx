import { AlertTriangle, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function ReportIssueModal({
  open,
  item,
  isPending,
  onClose,
  onSubmit,
}) {
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const maxQuantity = item?.quantity ?? 0;
  const unitPenalty = item?.priceIfLost ?? 0;
  const totalPenalty = useMemo(
    () => Number(quantity || 0) * Number(unitPenalty || 0),
    [quantity, unitPenalty],
  );

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Báo hỏng / mất vật tư</h2>
              <p className="mt-1 text-sm font-bold text-gray-500">
                {item.equipmentName || item.itemType || "Vật tư"} - phòng {item.roomNumber}
              </p>
            </div>
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
              roomInventoryId: item.id,
              quantity: Number(quantity),
              description: description.trim(),
              imageFile,
            });
          }}
          className="space-y-6 px-8 py-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                Số lượng hiện có
              </p>
              <p className="mt-2 text-2xl font-black text-gray-900">{maxQuantity}</p>
            </div>
            <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-500">
                Tiền phạt dự kiến
              </p>
              <p className="mt-2 text-2xl font-black text-amber-700">
                {totalPenalty.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Số lượng hỏng / mất
              </span>
              <input
                type="number"
                min="1"
                max={Math.max(1, maxQuantity)}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Đơn giá đền bù
              </span>
              <input
                value={`${Number(unitPenalty || 0).toLocaleString("vi-VN")} đ`}
                readOnly
                className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 outline-none"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              Ghi chú báo hỏng
            </span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả tình trạng hỏng / mất vật tư..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-blue-300 focus:bg-white"
            />
          </label>

          <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Ảnh minh chứng
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Ảnh sẽ được tải lên thư mục `home/broke/{item.roomNumber}`.
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
              disabled={isPending || maxQuantity <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-rose-700 disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              Gửi báo hỏng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
