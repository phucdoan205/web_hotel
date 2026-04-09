import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeDollarSign,
  ClipboardList,
  Eye,
  PackageSearch,
  Search,
  Settings2,
  Wrench,
  X,
} from "lucide-react";
import { housekeepingApi } from "../../api/housekeeping/housekeepingApi";
import ManualIssueReportModal from "../housekeeping/inventory/ManualIssueReportModal";
import { formatVietnamDateTime } from "../../utils/vietnamTime";

const parseApiError = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data || error?.message || fallback;

const getResolutionBadge = (resolutionType) =>
  resolutionType === "Restocked"
    ? { label: "Đã bổ sung", className: "bg-emerald-50 text-emerald-700" }
    : { label: "Chưa xử lý", className: "bg-gray-100 text-gray-600" };

const getShortageDetails = (item) =>
  item?.shortageDetails?.length
    ? item.shortageDetails
    : [{
        equipmentId: item?.equipmentId ?? null,
        equipmentName: item?.equipmentName ?? "Vật tư",
        equipmentCode: item?.equipmentCode ?? null,
        requestedQuantity: Number(item?.requestedQuantity ?? 0),
        availableQuantity: Number(item?.availableQuantity ?? 0),
        shortageQuantity: Number(item?.shortageQuantity ?? 0),
        note: item?.note ?? null,
      }];

function ReportDetailModal({ item, type, onClose, onProcess }) {
  if (!item) return null;
  const resolution = getResolutionBadge(item.resolutionType);
  const details = type === "shortage" ? getShortageDetails(item) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {type === "loss-damage" ? "Chi tiết hư hỏng & đền bù" : "Chi tiết thiếu vật tư"}
            </h2>
            <p className="mt-1 text-sm font-bold text-gray-500">
              Phòng {item.roomNumber} - {item.equipmentName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-8 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Phòng</p>
              <p className="mt-2 text-xl font-black text-gray-900">{item.roomNumber}</p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                {type === "loss-damage" ? "Số lượng mất / hỏng" : "Số lượng thiếu"}
              </p>
              <p className="mt-2 text-xl font-black text-gray-900">
                {type === "loss-damage" ? item.quantity : item.shortageQuantity}
              </p>
            </div>
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                {type === "loss-damage" ? "Tổng tiền đền bù" : "Tồn kho khả dụng"}
              </p>
              <p className="mt-2 text-xl font-black text-gray-900">
                {type === "loss-damage"
                  ? `${Number(item.penaltyAmount ?? 0).toLocaleString("vi-VN")} đ`
                  : `${Number(item.availableQuantity ?? 0).toLocaleString("vi-VN")} đơn vị`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${resolution.className}`}>
              {resolution.label}
            </span>
            {item.resolvedAt ? (
              <span className="text-sm font-bold text-gray-500">Xử lý lúc {formatVietnamDateTime(item.resolvedAt)}</span>
            ) : null}
            {item.resolvedQuantity ? (
              <span className="text-sm font-bold text-gray-500">Đã bổ sung: {item.resolvedQuantity}</span>
            ) : null}
          </div>

          {type === "loss-damage" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-gray-100 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Mã vật tư</p>
                  <p className="mt-2 text-base font-black text-gray-900">{item.equipmentCode || "Không có mã"}</p>
                </div>
                <div className="rounded-[24px] border border-gray-100 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Thời gian báo cáo</p>
                  <p className="mt-2 text-base font-black text-gray-900">{formatVietnamDateTime(item.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Mô tả báo cáo</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-gray-700">{item.description || "Không có mô tả."}</p>
              </div>
              {item.imageUrl ? (
                <div className="rounded-[24px] border border-gray-100 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Ảnh minh chứng</p>
                  <img src={item.imageUrl} alt={item.equipmentName} className="mt-4 h-72 w-full rounded-[20px] object-cover ring-1 ring-gray-100" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Danh sách vật tư thiếu</p>
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    {details.length} vật tư cần xử lý cho phòng {item.roomNumber}
                    {item.sourceRoomNumber ? `, clone từ phòng ${item.sourceRoomNumber}` : ""}.
                  </p>
                </div>
                {item.resolutionType !== "Restocked" ? (
                  <button type="button" onClick={onProcess} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-blue-700">
                    <Wrench className="size-4" />
                    Xử lý thiếu vật tư
                  </button>
                ) : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-[20px] border border-gray-100 bg-white">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Vật tư", "Mã", "Yêu cầu", "Khả dụng", "Thiếu", "Ghi chú"].map((heading) => (
                        <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {details.map((detail, index) => (
                      <tr key={`${detail.equipmentId ?? detail.equipmentName}-${index}`}>
                        <td className="px-4 py-3 text-sm font-black text-gray-900">{detail.equipmentName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-500">{detail.equipmentCode || "-"}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{detail.requestedQuantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{detail.availableQuantity}</td>
                        <td className="px-4 py-3 text-sm font-black text-rose-600">{detail.shortageQuantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-500">{detail.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessReportModal({ item, type, isPending, errorMessage, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState(type === "loss-damage" ? Number(item?.quantity ?? 1) : Number(item?.shortageQuantity ?? 1));
  if (!item) return null;

  const currentStatus = getResolutionBadge(item.resolutionType);
  const maxQuantity = type === "loss-damage" ? Number(item.quantity ?? 0) : Number(item.shortageQuantity ?? 0);
  const shortageDetails = type === "shortage" ? getShortageDetails(item) : [];
  const isGroupedShortage = type === "shortage" && shortageDetails.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{type === "loss-damage" ? "Xử lý báo cáo" : "Xử lý thiếu vật tư"}</h2>
            <p className="mt-1 text-sm font-bold text-gray-500">Phòng {item.roomNumber} - {item.equipmentName}</p>
          </div>
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-2xl p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-6">
            {errorMessage ? <div className="rounded-[20px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}
            <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Thông tin xử lý</p>
              <span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wide ${currentStatus.className}`}>{currentStatus.label}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700">Gửi lúc {formatVietnamDateTime(item.createdAt)}</p>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              {type === "loss-damage"
                ? `${item.quantity} vật tư cần bổ sung lại cho phòng.`
                : `${item.shortageQuantity} vật tư đang thiếu cần cấp thêm.`}
            </p>
          </div>

          {isGroupedShortage ? (
            <div className="rounded-[24px] border border-gray-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Danh sách cần bổ sung</p>
              <div className="mt-3 max-h-[40vh] space-y-3 overflow-y-auto pr-1">
                {shortageDetails.map((detail, index) => (
                  <div key={`${detail.equipmentId ?? detail.equipmentName}-${index}`} className="rounded-[20px] border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black text-gray-900">{detail.equipmentName}</p>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-rose-600">
                        Thiếu {detail.shortageQuantity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Yêu cầu {detail.requestedQuantity} • Có sẵn {detail.availableQuantity} • Mã {detail.equipmentCode || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-gray-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Số lượng bổ sung</p>
              <input
                type="number"
                min="1"
                max={Math.max(1, maxQuantity)}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-blue-300 focus:bg-white"
              />
              <p className="mt-2 text-sm font-semibold text-gray-500">Tối đa {maxQuantity} đơn vị theo báo cáo này.</p>
            </div>
          )}

          </div>

          <div className="border-t border-gray-100 bg-white px-8 py-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={isPending} className="rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-wide text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50">Hủy</button>
            <button
              type="button"
              disabled={isPending || (!isGroupedShortage && (Number(quantity) <= 0 || Number(quantity) > maxQuantity))}
              onClick={() => onSubmit({
                reportType: type,
                reportId: type === "loss-damage" ? item.id : item.notificationId,
                resolutionType: "Restocked",
                quantity: isGroupedShortage ? null : Number(quantity),
              })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Settings2 className="size-4" />
              Xác nhận bổ sung
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LossDamageManagementSection({
  title = "Thất thoát & đền bù",
  description = "Theo dõi vật tư thiếu, hư hỏng và các khoản đền bù của Housekeeping.",
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("loss-damage");
  const [search, setSearch] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState("loss-damage");
  const [processingItem, setProcessingItem] = useState(null);
  const [processingType, setProcessingType] = useState("loss-damage");
  const [processError, setProcessError] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["housekeepingInventoryReports"],
    queryFn: () => housekeepingApi.getInventoryReports(),
  });

  const manualReportMutation = useMutation({
    mutationFn: (payload) => housekeepingApi.reportInventoryIssueManual(payload),
    onSuccess: () => {
      setFeedback("Đã thêm báo cáo hư hỏng / thất thoát.");
      setIsManualModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["housekeepingInventoryReports"] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
    },
    onError: (submitError) => setFeedback(parseApiError(submitError, "Không gửi được báo cáo.")),
  });

  const resolveReportMutation = useMutation({
    mutationFn: (payload) => housekeepingApi.resolveInventoryReport(payload),
    onSuccess: (response) => {
      setProcessError("");
      setFeedback(response?.message || "Đã cập nhật xử lý báo cáo.");
      setProcessingItem(null);
      queryClient.invalidateQueries({ queryKey: ["housekeepingInventoryReports"] });
    },
    onError: (submitError) => setProcessError(parseApiError(submitError, "Không cập nhật được trạng thái xử lý.")),
  });

  const lossDamageReports = data?.lossDamageReports ?? [];
  const shortageReports = data?.shortageReports ?? [];

  const filteredLossDamageReports = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return lossDamageReports;
    return lossDamageReports.filter((item) =>
      `${item.roomNumber} ${item.equipmentName} ${item.equipmentCode || ""} ${item.description || ""}`.toLowerCase().includes(normalized),
    );
  }, [lossDamageReports, search]);

  const filteredShortageReports = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return shortageReports;
    return shortageReports.filter((item) =>
      `${item.roomNumber} ${item.equipmentName} ${item.equipmentCode || ""} ${item.note || ""} ${item.sourceRoomNumber || ""}`.toLowerCase().includes(normalized),
    );
  }, [shortageReports, search]);

  const statCards = [
    { id: "loss-count", label: "Báo cáo hư hỏng", value: data?.lossDamageReportCount ?? 0, hint: `${data?.lossDamageUnitCount ?? 0} vật tư đã ghi nhận`, icon: AlertTriangle, className: "bg-rose-50 text-rose-600" },
    { id: "penalty-total", label: "Tổng tiền đền bù", value: `${Number(data?.totalPenaltyAmount ?? 0).toLocaleString("vi-VN")} đ`, hint: "Tổng hợp từ checklist và báo cáo thủ công", icon: BadgeDollarSign, className: "bg-amber-50 text-amber-600" },
    { id: "shortage-count", label: "Báo cáo thiếu vật tư", value: data?.shortageReportCount ?? 0, hint: `${data?.shortageUnitCount ?? 0} đơn vị đang thiếu`, icon: PackageSearch, className: "bg-blue-50 text-blue-600" },
  ];

  const renderActionButtons = (item, reportType) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => { setDetailItem(item); setDetailType(reportType); }}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 hover:bg-slate-200"
      >
        <Eye className="size-4" />
        Xem
      </button>
      <button
        type="button"
        onClick={() => { setProcessError(""); setProcessingItem(item); setProcessingType(reportType); }}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
      >
        <Wrench className="size-4" />
        {reportType === "shortage" ? "Xử lý thiếu" : "Xử lý"}
      </button>
    </div>
  );

  return (
    <div className="animate-in space-y-6 fade-in duration-500">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{title}</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm phòng, vật tư..." className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-700 shadow-sm outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-50 sm:w-80" />
          </label>
          <button type="button" onClick={() => { setFeedback(""); setIsManualModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-rose-700">
            <ClipboardList className="size-4" />
            Thêm báo cáo
          </button>
        </div>
      </header>

      {feedback ? <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">{feedback}</div> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.id} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
                <p className="mt-2 text-sm font-semibold text-gray-500">{card.hint}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-2xl ${card.className}`}><card.icon className="size-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-3">
          {[{ id: "loss-damage", label: "Hư hỏng & đền bù", count: lossDamageReports.length }, { id: "shortage", label: "Thiếu vật tư", count: shortageReports.length }].map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-2xl px-5 py-3 text-sm font-black transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-4"><div className="h-16 animate-pulse rounded-3xl bg-gray-100" /><div className="h-16 animate-pulse rounded-3xl bg-gray-100" /><div className="h-16 animate-pulse rounded-3xl bg-gray-100" /></div>
        ) : error ? (
          <div className="mt-8 rounded-[1.5rem] border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">{parseApiError(error, "Không tải được báo cáo thất thoát & đền bù.")}</div>
        ) : activeTab === "loss-damage" ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="border-b border-gray-100"><tr>{["Phòng", "Vật tư", "Số lượng", "Đơn giá", "Tổng tiền", "Thời gian báo cáo", "Hành động"].map((heading) => <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 first:px-0">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLossDamageReports.length === 0 ? (
                  <tr><td colSpan={7} className="px-0 py-8 text-center text-sm font-bold text-gray-400">Chưa có báo cáo hư hỏng / đền bù nào.</td></tr>
                ) : filteredLossDamageReports.map((item) => (
                  <tr key={item.id}>
                    <td className="px-0 py-4"><p className="text-sm font-black text-gray-900">Phòng {item.roomNumber}</p></td>
                    <td className="px-4 py-4"><p className="text-sm font-black text-gray-900">{item.equipmentName}</p><p className="mt-1 text-xs font-bold text-gray-400">{item.equipmentCode || "Không có mã"}</p></td>
                    <td className="px-4 py-4 text-sm font-black text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm font-black text-gray-500">{Number(item.unitPenalty ?? 0).toLocaleString("vi-VN")} đ</td>
                    <td className="px-4 py-4 text-sm font-black text-amber-700">{Number(item.penaltyAmount ?? 0).toLocaleString("vi-VN")} đ</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-500">{formatVietnamDateTime(item.createdAt)}</td>
                    <td className="px-4 py-4">{renderActionButtons(item, "loss-damage")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[1260px] text-left">
              <thead className="border-b border-gray-100"><tr>{["Phòng", "Nguồn", "Tóm tắt thiếu", "Yêu cầu", "Khả dụng", "Thiếu", "Thời gian báo cáo", "Hành động"].map((heading) => <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 first:px-0">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredShortageReports.length === 0 ? (
                  <tr><td colSpan={8} className="px-0 py-8 text-center text-sm font-bold text-gray-400">Chưa có báo cáo thiếu vật tư nào.</td></tr>
                ) : filteredShortageReports.map((item) => {
                  const details = getShortageDetails(item);
                  return (
                    <tr key={item.notificationId}>
                      <td className="px-0 py-4"><p className="text-sm font-black text-gray-900">Phòng {item.roomNumber}</p></td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-500">{item.sourceRoomNumber ? `Clone từ ${item.sourceRoomNumber}` : "Bổ sung thủ công"}</td>
                      <td className="px-4 py-4"><p className="text-sm font-black text-gray-900">{item.equipmentName}</p><p className="mt-1 text-xs font-bold text-gray-400">{details.length} vật tư • {item.equipmentCode || "Xem chi tiết để thấy danh sách"}</p></td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{item.requestedQuantity}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-500">{item.availableQuantity}</td>
                      <td className="px-4 py-4 text-sm font-black text-rose-600">{item.shortageQuantity}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-500">{formatVietnamDateTime(item.createdAt)}</td>
                      <td className="px-4 py-4">{renderActionButtons(item, "shortage")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ManualIssueReportModal open={isManualModalOpen} isPending={manualReportMutation.isPending} onClose={() => setIsManualModalOpen(false)} onSubmit={(payload) => manualReportMutation.mutate(payload)} />
      <ReportDetailModal item={detailItem} type={detailType} onClose={() => setDetailItem(null)} onProcess={() => { setProcessError(""); setProcessingItem(detailItem); setProcessingType(detailType); setDetailItem(null); }} />
      <ProcessReportModal key={`${processingType}-${processingItem?.id ?? processingItem?.notificationId ?? "none"}`} item={processingItem} type={processingType} isPending={resolveReportMutation.isPending} errorMessage={processError} onClose={() => { setProcessingItem(null); setProcessError(""); }} onSubmit={(payload) => { setProcessError(""); resolveReportMutation.mutate(payload); }} />
    </div>
  );
}


