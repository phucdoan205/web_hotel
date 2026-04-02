import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { lossAndDamageApi } from "../../api/inventoryApi";

const statusMeta = (decisionStatus) => {
  if (decisionStatus === 1) return { label: "Đã duyệt", cls: "chip chipOk" };
  if (decisionStatus === 2) return { label: "Từ chối", cls: "chip chipBad" };
  return { label: "Chờ xử lý", cls: "chip chipWait" };
};

export default function ReceptionistLossDamagePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await lossAndDamageApi.getAll();
      setReports(res.data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const decision = typeof r.decisionStatus === "number" ? r.decisionStatus : 0;
      const okFilter =
        filter === "all" ||
        (filter === "pending" && decision === 0) ||
        (filter === "resolved" && decision !== 0);

      const okSearch =
        !q ||
        String(r.roomNumber || "").toLowerCase().includes(q) ||
        String(r.itemName || "").toLowerCase().includes(q);

      return okFilter && okSearch;
    });
  }, [filter, reports, search]);

  const approve = async (id) => {
    try {
      await lossAndDamageApi.approve(id);
      await load();
    } catch {
      return;
    }
  };

  const reject = async (id) => {
    try {
      await lossAndDamageApi.reject(id);
      await load();
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl font-black text-slate-900">Thất thoát &amp; Đền bù</div>
          <div className="mt-1 text-[11px] font-black tracking-widest uppercase text-slate-400">
            Xác nhận và xử lý các báo cáo từ Housekeeping
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex bg-slate-100 rounded-full p-1">
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-black ${filter === "all" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-black ${filter === "pending" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
              onClick={() => setFilter("pending")}
            >
              Chờ xử lý
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-sm font-black ${filter === "resolved" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
              onClick={() => setFilter("resolved")}
            >
              Đã xong
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent outline-none text-sm font-bold text-slate-700 w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo phòng..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[11px] font-black tracking-widest uppercase text-slate-400">
                <th className="text-left px-5 py-4 w-28">Phòng</th>
                <th className="text-left px-5 py-4">Vật tư</th>
                <th className="text-center px-5 py-4 w-28">Số lượng</th>
                <th className="text-center px-5 py-4 w-40">Phí đền bù</th>
                <th className="text-center px-5 py-4 w-40">Trạng thái</th>
                <th className="text-right px-5 py-4 w-56">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-bold">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-bold">
                    Không có báo cáo nào.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const decision = typeof r.decisionStatus === "number" ? r.decisionStatus : 0;
                  const chip = statusMeta(decision);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-black text-slate-800">{r.roomNumber}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{r.itemName}</td>
                      <td className="px-5 py-4 text-center font-black text-slate-800">{r.quantity}</td>
                      <td className="px-5 py-4 text-center font-black text-rose-500">
                        {Number(r.penaltyAmount || 0).toLocaleString()}đ
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            chip.cls === "chip chipOk"
                              ? "bg-emerald-50 text-emerald-600"
                              : chip.cls === "chip chipBad"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {chip.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {decision === 0 ? (
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600"
                              onClick={() => reject(r.id)}
                            >
                              Từ chối
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700"
                              onClick={() => approve(r.id)}
                            >
                              Duyệt
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
