import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
  SprayCan,
  UserRoundCheck,
  WandSparkles,
} from "lucide-react";
import { housekeepingApi } from "../../api/admin/housekeepingApi";
import { hasPermission } from "../../utils/permissions";
import { motion } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Dirty", label: "Cần dọn" },
  { value: "Pickup", label: "Dọn nhẹ" },
  { value: "InProgress", label: "Đang dọn" },
  { value: "Clean", label: "Đã sạch" },
];

const TASK_TABS = [
  {
    id: "all",
    label: "Tất cả nhiệm vụ",
    description: "Xem toàn bộ phòng cần xử lý trong ca.",
  },
  {
    id: "mine",
    label: "Phòng tôi đang nhận",
    description: "Các phòng bạn đã nhận hoặc đang tiếp tục checklist.",
  },
];

const getPriorityClass = (priority) => {
  switch (priority) {
    case "High":
      return "bg-rose-50 text-rose-600 ring-rose-100";
    case "Working":
      return "bg-amber-50 text-amber-600 ring-amber-100";
    default:
      return "bg-sky-50 text-sky-700 ring-sky-100";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "Dirty":
      return "bg-rose-50 text-rose-600 ring-rose-100";
    case "Pickup":
      return "bg-sky-50 text-sky-700 ring-sky-100";
    case "InProgress":
      return "bg-amber-50 text-amber-600 ring-amber-100";
    case "Clean":
      return "bg-emerald-50 text-emerald-600 ring-emerald-100";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-200";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "Dirty":
      return "Cần dọn";
    case "Pickup":
      return "Dọn nhẹ";
    case "InProgress":
      return "Đang dọn";
    case "Clean":
      return "Đã sạch";
    default:
      return status || "Không rõ";
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case "High":
      return "Ưu tiên cao";
    case "Working":
      return "Đang xử lý";
    default:
      return "Bình thường";
  }
};

const getTaskTypeLabel = (taskType) => {
  if (!taskType) return "Nhiệm vụ dọn phòng";
  return taskType;
};

const isActionableTask = (task) =>
  task.cleaningStatus === "Dirty" || task.cleaningStatus === "Pickup";

const isCurrentUserTask = (task) => Boolean(task.isAssignedToCurrentUser);

function TaskCard({ task, onAccept, onOpenChecklist, isAccepting }) {
  const actionable = isActionableTask(task);
  const canAccept = actionable && !task.isLockedByOther;
  const canContinue = actionable && task.isAssignedToCurrentUser;
  const canViewHousekeeping = hasPermission("VIEW_HOUSEKEEPING");
  const canAssignHousekeeping = hasPermission("ASSIGN_HOUSEKEEPING");

  const status = getStatusLabel(task.cleaningStatus);
  const priority = getPriorityLabel(task.priority);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-sky-100/50"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Room Preview */}
        <div className="relative shrink-0">
          {task.previewImageUrl ? (
            <img
              src={task.previewImageUrl}
              alt={`Phòng ${task.roomNumber}`}
              className="h-32 w-40 rounded-[2rem] object-cover ring-1 ring-slate-100 shadow-sm"
            />
          ) : (
            <div className="flex h-32 w-40 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-300 ring-1 ring-slate-100">
              <BedDouble className="size-10" />
            </div>
          )}
          <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-black text-slate-900 shadow-lg ring-1 ring-slate-100">
             {task.floor ?? "?"}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-4xl font-black tracking-tighter text-slate-900">{task.roomNumber}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${getStatusClass(task.cleaningStatus)}`}>
                {status}
              </span>
              <span className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${getPriorityClass(task.priority)}`}>
                {priority}
              </span>
            </div>
          </div>
          
          <p className="mt-1 text-sm font-bold text-slate-400 uppercase tracking-wider">
            {task.roomTypeName || "Phòng tiêu chuẩn"}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-colors group-hover:bg-white group-hover:border-sky-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loại nhiệm vụ</p>
              <div className="mt-2 flex items-center gap-2">
                 <WandSparkles className="size-4 text-sky-500" />
                 <p className="text-sm font-extrabold text-slate-700">{getTaskTypeLabel(task.taskType)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-colors group-hover:bg-white group-hover:border-sky-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vật tư cần kiểm</p>
              <div className="mt-2 flex items-center gap-2">
                 <SprayCan className="size-4 text-amber-500" />
                 <p className="text-sm font-extrabold text-slate-700">{task.inventoryCount ?? 0} mục</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-50 bg-slate-50/50 p-4 transition-colors group-hover:bg-white group-hover:border-sky-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phụ trách</p>
              <div className="mt-2 flex items-center gap-2">
                 <UserRoundCheck className={`size-4 ${task.isAssignedToCurrentUser ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className={`text-sm font-extrabold ${task.isAssignedToCurrentUser ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {task.isAssignedToCurrentUser 
                      ? "Bạn đang dọn" 
                      : task.isLockedByOther 
                        ? (task.assignedToName || "Đã có người nhận") 
                        : "Chưa có người nhận"}
                  </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-3 lg:w-48">
          {canAccept && canAssignHousekeeping && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAccept(task.roomId)}
              disabled={isAccepting}
              className="flex h-14 items-center justify-center rounded-2xl bg-sky-600 px-6 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 disabled:opacity-50"
            >
              {isAccepting ? <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (canContinue ? "Tiếp tục" : "Nhận nhiệm vụ")}
            </motion.button>
          )}

          {canViewHousekeeping && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenChecklist(task.roomId)}
              className="flex h-14 items-center justify-center rounded-2xl bg-white border-2 border-emerald-500 px-6 text-sm font-black text-emerald-600 transition hover:bg-emerald-50"
            >
              Xem chi tiết
            </motion.button>
          )}

          {actionable && task.isLockedByOther && !task.isAssignedToCurrentUser && (
             <div className="flex h-14 items-center justify-center rounded-2xl bg-slate-100 px-6 text-center text-xs font-bold text-slate-400">
                Đang được dọn bởi nhân viên khác
             </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function HousekeepingTasksPage() {
  const canViewHousekeeping = hasPermission("VIEW_HOUSEKEEPING");
  const canAssignHousekeeping = hasPermission("ASSIGN_HOUSEKEEPING");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const queryParams = useMemo(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    return params;
  }, [search, status]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["housekeepingTasks", queryParams],
    queryFn: () => housekeepingApi.getTasks(queryParams),
    enabled: canViewHousekeeping,
  });

  const acceptMutation = useMutation({
    mutationFn: (roomId) => housekeepingApi.acceptTask(roomId),
    onSuccess: (taskDetail) => {
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
      queryClient.invalidateQueries({
        queryKey: ["housekeepingTaskDetail", taskDetail.roomId],
      });
      navigate(`/admin/housekeeping/tasks/${taskDetail.roomId}`);
    },
  });

  const tasks = data?.items ?? [];

  const myTasksCount = useMemo(
    () => tasks.filter((task) => isCurrentUserTask(task)).length,
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    if (activeTab === "mine") {
      return tasks.filter((task) => isCurrentUserTask(task));
    }

    return tasks;
  }, [activeTab, tasks]);

  const summaryCards = [
    {
      label: "Tổng nhiệm vụ",
      value: data?.totalCount ?? 0,
      icon: Sparkles,
      color: "bg-sky-50 text-sky-600 ring-sky-100",
    },
    {
      label: "Chờ nhận",
      value: data?.pendingCount ?? 0,
      icon: SprayCan,
      color: "bg-rose-50 text-rose-600 ring-rose-100",
    },
    {
      label: "Đang dọn",
      value: data?.inProgressCount ?? 0,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: "Phòng của tôi",
      value: myTasksCount,
      icon: UserRoundCheck,
      color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
  ];

  return (
    <div className="animate-in space-y-7 fade-in duration-500">
      {!canViewHousekeeping ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-bold text-amber-900">
          Bạn không có quyền xem nhiệm vụ dọn phòng.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2.5rem] border border-sky-100 bg-white text-slate-900 shadow-xl shadow-sky-100/70">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(135deg,_#ffffff,_#f5fbff_55%,_#e0f2fe)] px-7 py-8 sm:px-9">
          <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-sky-700">
                Housekeeping task board
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tighter text-slate-900 sm:text-6xl">
                Nhiệm vụ dọn phòng
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] font-bold leading-relaxed text-slate-500">
                Giao diện tối ưu hóa giúp bạn theo dõi nhanh các phòng cần dọn dẹp, 
                tiếp tục checklist dang dở và quản lý công việc hiệu quả hơn trong ca làm việc.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:min-w-[34rem]">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-sky-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm số phòng hoặc loại phòng..."
                  className="w-full rounded-2xl border border-sky-100 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-2xl border border-sky-100 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section summary cards removed per request */}

      <section className="rounded-[2rem] border border-sky-100 bg-white p-3 shadow-sm shadow-sky-100/60">
        <div className="grid gap-3 md:grid-cols-2">
          {TASK_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === "mine" ? myTasksCount : tasks.length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[1.5rem] border px-5 py-4 text-left transition ${
                  isActive
                    ? "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 shadow-sm"
                    : "border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-black tracking-tight text-slate-900">{tab.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{tab.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-black ${
                      isActive ? "bg-white text-sky-700" : "bg-white text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {canViewHousekeeping && error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-bold text-rose-700">
          Không tải được nhiệm vụ dọn phòng. Khả năng cao backend chưa restart nên route
          ` /api/Housekeeping/tasks ` chưa có.
          {` ${error.message || ""}`.trim()}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {activeTab === "mine" ? "Danh sách phòng bạn đang nhận" : "Danh sách nhiệm vụ"}
            </h2>
            <p className="mt-1 text-[15px] font-medium leading-6 text-slate-500">
              {activeTab === "mine"
                ? "Chỉ hiển thị các phòng bạn đã nhận hoặc đang tiếp tục xử lý."
                : "Ưu tiên nhận các phòng cần dọn ngay để tránh tồn việc trong ca."}
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-2.5 text-xs font-black text-emerald-700 shadow-sm shadow-emerald-50">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="uppercase tracking-widest">Hiển thị {visibleTasks.length} phòng</span>
          </div>
        </div>

        {!canViewHousekeeping ? null : isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[2rem] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <WandSparkles className="size-7" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900">
              {activeTab === "mine" ? "Bạn chưa nhận phòng nào" : "Chưa có nhiệm vụ phù hợp"}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500">
              {activeTab === "mine"
                ? "Khi bạn nhận nhiệm vụ hoặc đang dọn một phòng, phòng đó sẽ xuất hiện trong tab này để theo dõi nhanh."
                : "Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm. Khi phòng chuyển sang cần dọn, nhiệm vụ sẽ xuất hiện tại đây."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleTasks.map((task) => (
              <TaskCard
                key={task.roomId}
                task={task}
                isAccepting={acceptMutation.isPending}
                onAccept={(roomId) => {
                  if (!canAssignHousekeeping) return;
                  acceptMutation.mutate(roomId);
                }}
                onOpenChecklist={(roomId) => {
                  if (!canViewHousekeeping) return;
                  navigate(`/admin/housekeeping/tasks/${roomId}`);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
