import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BadgeDollarSign, ClipboardList, PackageSearch, Search } from "lucide-react";
import { housekeepingApi } from "../../api/housekeeping/housekeepingApi";
import ManualIssueReportModal from "../../components/housekeeping/inventory/ManualIssueReportModal";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const parseApiError = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallbackMessage;

export default function HousekeepingInventoryManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("loss-damage");
  const [search, setSearch] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["housekeepingInventoryReports"],
    queryFn: () => housekeepingApi.getInventoryReports(),
  });

  const manualReportMutation = useMutation({
    mutationFn: (payload) => housekeepingApi.reportInventoryIssueManual(payload),
    onSuccess: () => {
      setFeedback("Da them bao cao hu hong / that thoat.");
      setIsManualModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["housekeepingInventoryReports"] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingTasks"] });
    },
    onError: (submitError) => {
      setFeedback(parseApiError(submitError, "Khong gui duoc bao cao."));
    },
  });

  const lossDamageReports = data?.lossDamageReports ?? [];
  const shortageReports = data?.shortageReports ?? [];

  const filteredLossDamageReports = useMemo(() => {
    if (!search.trim()) return lossDamageReports;
    const normalized = search.trim().toLowerCase();
    return lossDamageReports.filter((item) =>
      `${item.roomNumber} ${item.equipmentName} ${item.equipmentCode || ""} ${item.description || ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [lossDamageReports, search]);

  const filteredShortageReports = useMemo(() => {
    if (!search.trim()) return shortageReports;
    const normalized = search.trim().toLowerCase();
    return shortageReports.filter((item) =>
      `${item.roomNumber} ${item.equipmentName} ${item.equipmentCode || ""} ${item.note || ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [shortageReports, search]);

  const statCards = [
    {
      id: "loss-count",
      label: "Bao cao hu hong",
      value: data?.lossDamageReportCount ?? 0,
      hint: `${data?.lossDamageUnitCount ?? 0} vat tu da ghi nhan`,
      icon: AlertTriangle,
      className: "bg-rose-50 text-rose-600",
    },
    {
      id: "penalty-total",
      label: "Tong tien den bu",
      value: `${Number(data?.totalPenaltyAmount ?? 0).toLocaleString("vi-VN")} d`,
      hint: "Tong hop tu checklist va bao cao thu cong",
      icon: BadgeDollarSign,
      className: "bg-amber-50 text-amber-600",
    },
    {
      id: "shortage-count",
      label: "Bao cao thieu vat tu",
      value: data?.shortageReportCount ?? 0,
      hint: `${data?.shortageUnitCount ?? 0} don vi dang thieu`,
      icon: PackageSearch,
      className: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">That thoat & den bu</h1>
          <p className="mt-1 text-sm font-bold text-gray-400">
            Theo doi vat tu thieu, hu hong va cac khoan den bu cua Housekeeping.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim phong, vat tu..."
              className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm font-bold text-gray-700 shadow-sm outline-none transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-50 sm:w-80"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setFeedback("");
              setIsManualModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-rose-700"
          >
            <ClipboardList className="size-4" />
            Them bao cao
          </button>
        </div>
      </header>

      {feedback ? (
        <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.id} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
                <p className="mt-2 text-sm font-semibold text-gray-500">{card.hint}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-2xl ${card.className}`}>
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap gap-3">
          {[
            { id: "loss-damage", label: "Hu hong & den bu", count: lossDamageReports.length },
            { id: "shortage", label: "Thieu vat tu", count: shortageReports.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            <div className="h-16 animate-pulse rounded-3xl bg-gray-100" />
            <div className="h-16 animate-pulse rounded-3xl bg-gray-100" />
            <div className="h-16 animate-pulse rounded-3xl bg-gray-100" />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[1.5rem] border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {parseApiError(error, "Khong tai duoc bao cao that thoat & den bu.")}
          </div>
        ) : activeTab === "loss-damage" ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Phong", "Vat tu", "So luong", "Don gia", "Tong tien", "Thoi gian", "Mo ta"].map((heading) => (
                    <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 first:px-0">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLossDamageReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-0 py-8 text-center text-sm font-bold text-gray-400">
                      Chua co bao cao hu hong / den bu nao.
                    </td>
                  </tr>
                ) : (
                  filteredLossDamageReports.map((item) => (
                    <tr key={item.id}>
                      <td className="px-0 py-4">
                        <p className="text-sm font-black text-gray-900">Phong {item.roomNumber}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-gray-900">{item.equipmentName}</p>
                        <p className="mt-1 text-xs font-bold text-gray-400">{item.equipmentCode || "Khong co ma"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-500">
                        {Number(item.unitPenalty ?? 0).toLocaleString("vi-VN")} d
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-amber-700">
                        {Number(item.penaltyAmount ?? 0).toLocaleString("vi-VN")} d
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-500">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-4">
                        <p className="max-w-xs text-sm font-semibold text-gray-600">
                          {item.description || "Khong co mo ta"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Phong", "Vat tu", "Yeu cau", "Ton kho", "Thieu", "Thoi gian", "Ghi chu"].map((heading) => (
                    <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 first:px-0">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredShortageReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-0 py-8 text-center text-sm font-bold text-gray-400">
                      Chua co bao cao thieu vat tu nao.
                    </td>
                  </tr>
                ) : (
                  filteredShortageReports.map((item) => (
                    <tr key={item.notificationId}>
                      <td className="px-0 py-4">
                        <p className="text-sm font-black text-gray-900">Phong {item.roomNumber}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-gray-900">{item.equipmentName}</p>
                        <p className="mt-1 text-xs font-bold text-gray-400">{item.equipmentCode || "Khong co ma"}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{item.requestedQuantity}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-500">{item.availableQuantity}</td>
                      <td className="px-4 py-4 text-sm font-black text-rose-600">{item.shortageQuantity}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-500">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-4">
                        <p className="max-w-xs text-sm font-semibold text-gray-600">
                          {item.note || "Khong co ghi chu"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ManualIssueReportModal
        open={isManualModalOpen}
        isPending={manualReportMutation.isPending}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={(payload) => manualReportMutation.mutate(payload)}
      />
    </div>
  );
}
