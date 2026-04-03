import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, Search, Sparkles, SprayCan, WandSparkles } from "lucide-react";
import { housekeepingApi } from "../../api/housekeeping/housekeepingApi";

const getPriorityClass = (priority) => {
  switch (priority) {
    case "High":
      return "bg-rose-50 text-rose-600";
    case "Working":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-sky-50 text-sky-600";
  }
};

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

export default function HousekeepingTasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const queryParams = useMemo(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    return params;
  }, [search, status]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["housekeepingTasks", queryParams],
    queryFn: () => housekeepingApi.getTasks(queryParams),
  });

  const acceptMutation = useMutation({
    mutationFn: (roomId) => housekeepingApi.acceptTask(roomId),
    onSuccess: (taskDetail) => {
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTaskDetail", taskDetail.roomId] });
      navigate(`/housekeeping/tasks/${taskDetail.roomId}`);
    },
  });

  const tasks = data?.items ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Nhiệm vụ dọn phòng</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Hiển thị các phòng đang bẩn, cần dọn nhẹ hoặc đang được xử lý.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm số phòng hoặc loại phòng..."
              className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-700 shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-50 sm:w-80"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-black text-gray-700 shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-50"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Dirty">Dirty</option>
            <option value="Pickup">Pickup</option>
            <option value="InProgress">InProgress</option>
            <option value="Clean">Clean</option>
          </select>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-4">
        {[
          {
            label: "Tổng nhiệm vụ",
            value: data?.totalCount ?? 0,
            icon: Sparkles,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Chờ nhận",
            value: data?.pendingCount ?? 0,
            icon: SprayCan,
            color: "bg-rose-50 text-rose-600",
          },
          {
            label: "Đang dọn",
            value: data?.inProgressCount ?? 0,
            icon: Clock3,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Đã dọn",
            value: data?.completedCount ?? 0,
            icon: WandSparkles,
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`flex size-11 items-center justify-center rounded-2xl ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Housekeeping
              </span>
            </div>
            <p className="mt-5 text-[11px] font-black uppercase tracking-widest text-gray-400">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-bold text-rose-700">
          Không tải được nhiệm vụ dọn phòng. Khả năng cao backend chưa restart nên route
          ` /api/Housekeeping/tasks ` chưa có.
          {` ${error.message || ""}`.trim()}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-gray-100 bg-gray-50/70">
              <tr>
                {["Phòng", "Loại nhiệm vụ", "Ưu tiên", "Vật tư", "Trạng thái", "Thao tác"].map((heading) => (
                  <th key={heading} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-8 py-5"><div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-28 animate-pulse rounded-full bg-gray-100" /></td>
                    <td className="px-8 py-5"><div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" /></td>
                    <td className="px-8 py-5"><div className="h-4 w-16 animate-pulse rounded-full bg-gray-100" /></td>
                    <td className="px-8 py-5"><div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" /></td>
                    <td className="px-8 py-5"><div className="h-9 w-32 animate-pulse rounded-2xl bg-gray-100" /></td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-lg font-black text-gray-900">Chưa có nhiệm vụ nào</p>
                    <p className="mt-2 text-sm font-bold text-gray-400">
                      Khi phòng chuyển sang Dirty hoặc Pickup, nhiệm vụ sẽ xuất hiện tại đây.
                    </p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.roomId} className="hover:bg-gray-50/60">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        {task.previewImageUrl ? (
                          <img
                            src={task.previewImageUrl}
                            alt={task.roomNumber}
                            className="h-14 w-20 rounded-2xl object-cover ring-1 ring-gray-200"
                          />
                        ) : (
                          <div className="h-14 w-20 rounded-2xl bg-gray-100" />
                        )}
                        <div>
                          <p className="text-lg font-black text-gray-900">{task.roomNumber}</p>
                          <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                            Tầng {task.floor ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-gray-900">{task.taskType}</p>
                      <p className="mt-1 text-xs font-bold text-gray-400">{task.roomTypeName}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-gray-700">{task.inventoryCount}</td>
                    <td className="px-8 py-5">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClass(task.cleaningStatus)}`}>
                        {task.cleaningStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {task.cleaningStatus === "Dirty" || task.cleaningStatus === "Pickup" ? (
                          task.isLockedByOther ? (
                            <span className="rounded-2xl bg-gray-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-400">
                              Đã có người nhận
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => acceptMutation.mutate(task.roomId)}
                              disabled={acceptMutation.isPending}
                              className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition-all hover:bg-blue-700 disabled:opacity-60"
                            >
                              {task.isAssignedToCurrentUser ? "Tiếp tục checklist" : "Nhận nhiệm vụ"}
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate(`/housekeeping/tasks/${task.roomId}`)}
                            className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-600"
                          >
                            Mở checklist
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
