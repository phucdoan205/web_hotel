import { LoaderCircle, TriangleAlert, X } from "lucide-react";

export default function DeleteRoomDialog({
  open,
  room,
  isPending,
  error,
  onClose,
  onConfirm,
}) {
  if (!open || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Chuyển phòng sang OutOfOrder</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Phòng <span className="font-black text-slate-700">{room.roomNumber}</span> sẽ
                vẫn hiển thị trong danh sách, chỉ đổi trạng thái sang{" "}
                <span className="font-black text-rose-600">OutOfOrder</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 px-8 py-6">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Bạn có thể khôi phục lại phòng này bất cứ lúc nào. Khi khôi phục, trạng thái phòng sẽ trở về Available.
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-8 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Không
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            Có, chuyển OutOfOrder
          </button>
        </div>
      </div>
    </div>
  );
}
