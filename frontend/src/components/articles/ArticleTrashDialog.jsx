import { LoaderCircle, TriangleAlert, X } from "lucide-react";

export default function ArticleTrashDialog({
  open,
  article,
  mode = "delete",
  isPending = false,
  error = "",
  onClose,
  onConfirm,
}) {
  if (!open || !article) {
    return null;
  }

  const isHardDelete = mode === "hardDelete";
  const isRestore = mode === "restore";
  const title = isRestore
    ? "Khôi phục bài viết"
    : isHardDelete
      ? "Xóa hẳn bài viết"
      : "Chuyển bài viết vào thùng rác";
  const description = isRestore
    ? "Bài viết sẽ xuất hiện lại theo đúng trạng thái trước đó."
    : isHardDelete
      ? "Bài viết chưa duyệt này sẽ bị xóa hẳn khỏi hệ thống và cơ sở dữ liệu."
      : "Bài viết sẽ không bị xóa vĩnh viễn. Bạn có thể mở thùng rác để xem và khôi phục lại sau.";
  const confirmLabel = isRestore
    ? "Có, khôi phục bài viết"
    : isHardDelete
      ? "Có, xóa hẳn bài viết"
      : "Có, chuyển vào thùng rác";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
          <div className="flex items-start gap-4">
            <div className={`flex size-12 items-center justify-center rounded-2xl ${isRestore ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                <span className="font-black text-slate-800">{article.title}</span>
                {" "}
                {description}
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
            {isRestore
              ? "Bài đã duyệt sẽ hiển thị lại cho người dùng sau khi khôi phục. Bài chưa duyệt sẽ trở về trạng thái chờ duyệt."
              : isHardDelete
                ? "Thao tác này không thể hoàn tác. Toàn bộ bình luận của bài viết cũng sẽ bị xóa."
                : "Sau khi chuyển vào thùng rác, danh sách bài viết sẽ chỉ còn tác vụ xem và khôi phục."}
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
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 ${isRestore ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" : "bg-rose-600 shadow-rose-100 hover:bg-rose-700"}`}
          >
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
