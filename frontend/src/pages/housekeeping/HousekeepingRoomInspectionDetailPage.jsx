import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, Search } from "lucide-react";
import { housekeepingApi } from "../../api/housekeeping/housekeepingApi";
import ReportIssueModal from "../../components/housekeeping/inspection/ReportIssueModal";

const getStatusClass = (status) => {
  switch (status) {
    case "Dirty":
      return "bg-rose-50 text-rose-600";
    case "Pickup":
      return "bg-sky-50 text-sky-600";
    case "InProgress":
      return "bg-amber-50 text-amber-600";
    case "Clean":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function HousekeepingRoomInspectionDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["housekeepingTaskDetail", roomId],
    queryFn: () => housekeepingApi.getTaskDetail(roomId),
    enabled: Boolean(roomId),
  });

  const acceptMutation = useMutation({
    mutationFn: () => housekeepingApi.acceptTask(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTaskDetail", roomId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => housekeepingApi.completeTask(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTaskDetail", roomId] });
      navigate("/housekeeping/tasks");
    },
  });

  const reportIssueMutation = useMutation({
    mutationFn: (payload) => housekeepingApi.reportInventoryIssue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housekeepingTaskDetail", roomId] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
      setSelectedItem(null);
    },
  });

  const filteredInventory = useMemo(() => {
    const inventory = data?.inventory ?? [];
    if (!search.trim()) return inventory;

    const normalized = search.trim().toLowerCase();
    return inventory.filter((item) =>
      (item.equipmentName || item.itemType || "").toLowerCase().includes(normalized),
    );
  }, [data?.inventory, search]);

  if (!roomId) {
    return (
      <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-sm font-bold text-rose-700">
        Không tìm thấy mã phòng.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link
          to="/housekeeping/tasks"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-gray-600 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-gray-50"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Checklist phòng {data?.roomNumber ?? roomId}</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Kiểm tra vật tư, ghi nhận hỏng/mất và hoàn tất nhiệm vụ dọn phòng.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="h-6 w-56 animate-pulse rounded-full bg-gray-100" />
          <div className="mt-6 h-40 animate-pulse rounded-[2rem] bg-gray-100" />
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-sm font-bold text-rose-700">
          {error.response?.data || "Bạn không thể mở checklist này vì phòng đã được tài khoản khác nhận nhiệm vụ."}
        </div>
      ) : data ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">
                    {data.roomTypeName}
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-gray-900">
                    Phòng {data.roomNumber}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">
                      Tầng {data.floor ?? "-"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClass(data.cleaningStatus)}`}>
                      {data.cleaningStatus}
                    </span>
                  </div>
                </div>

                {data.previewImageUrl ? (
                  <img
                    src={data.previewImageUrl}
                    alt={data.roomNumber}
                    className="h-40 w-full rounded-[2rem] object-cover ring-1 ring-gray-100 lg:w-72"
                  />
                ) : (
                  <div className="h-40 w-full rounded-[2rem] bg-gray-100 lg:w-72" />
                )}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                Hành động
              </h3>
              <div className="mt-5 space-y-3">
                {data.cleaningStatus === "Dirty" || data.cleaningStatus === "Pickup" ? (
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                    className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-blue-700 disabled:opacity-60"
                  >
                    Nhận nhiệm vụ
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending || data.cleaningStatus !== "InProgress" || data.isLockedByOther}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
                >
                  <CheckCircle2 className="size-4" />
                  Hoàn tất dọn phòng
                </button>

                <div className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4 text-sm font-semibold text-gray-600">
                  Khi hoàn tất, trạng thái dọn phòng sẽ được chuyển sang <span className="font-black text-emerald-600">Clean</span>.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Checklist vật tư phòng</h3>
                <p className="mt-1 text-sm font-bold text-gray-400">
                  Danh sách vật tư hiện có trong phòng. Bấm báo hỏng/mất để ghi nhận và cập nhật hệ thống.
                </p>
              </div>

              <label className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm nhanh vật tư..."
                  className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-700 shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-50 lg:w-80"
                />
              </label>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-gray-100">
                  <tr>
                    {["Tên vật tư", "Mã", "Số lượng chuẩn", "Đơn giá đền bù", "Trạng thái"].map((heading) => (
                      <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 first:px-0">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-0 py-4">
                        <div>
                          <p className="text-sm font-black text-gray-900">{item.equipmentName || item.itemType}</p>
                          <p className="mt-1 text-xs font-bold text-gray-400">{item.note || "Không có ghi chú"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-gray-500">{item.equipmentCode || "-"}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{item.quantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm font-black text-amber-700">
                        {Number(item.priceIfLost ?? 0).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-4">
                        {Number(item.quantity ?? 0) > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-rose-600 transition-all hover:bg-rose-100"
                          >
                            <AlertTriangle className="size-4" />
                            Báo hỏng / mất
                          </button>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gray-400">
                            Đã hết
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <ReportIssueModal
        key={selectedItem?.id ?? "report-issue"}
        open={Boolean(selectedItem)}
        item={selectedItem}
        isPending={reportIssueMutation.isPending}
        onClose={() => setSelectedItem(null)}
        onSubmit={(payload) => reportIssueMutation.mutate(payload)}
      />
    </div>
  );
}
