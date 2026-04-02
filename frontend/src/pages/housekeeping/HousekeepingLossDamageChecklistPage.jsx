import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, ChevronLeft, Search } from "lucide-react";
import { inventoryApi, lossAndDamageApi } from "../../api/inventoryApi";
import { roomsApi } from "../../api/roomsApi";

export default function HousekeepingLossDamageChecklistPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [reportingItem, setReportingItem] = useState(null);
  const [reportData, setReportData] = useState({
    quantity: 1,
    penaltyAmount: 0,
    description: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [roomsRes, invRes] = await Promise.all([
          roomsApi.getAll(),
          inventoryApi.getByRoom(roomId),
        ]);
        if (cancelled) return;
        const rooms = roomsRes.data?.items ?? roomsRes.data ?? [];
        setRoom(rooms.find((r) => String(r.id) === String(roomId)) || null);
        setInventory(invRes.data || []);
      } catch {
        if (!cancelled) setInventory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((x) => x.itemName?.toLowerCase().includes(q));
  }, [inventory, search]);

  const openReport = (item) => {
    setReportingItem(item);
    setReportData({
      quantity: 1,
      penaltyAmount: Number(item.priceIfLost || 0),
      description: "",
      imageUrl: "",
    });
  };

  const closeReport = () => {
    setReportingItem(null);
    setReportData({
      quantity: 1,
      penaltyAmount: 0,
      description: "",
      imageUrl: "",
    });
  };

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await lossAndDamageApi.uploadImage(file);
      setReportData((prev) => ({ ...prev, imageUrl: res.data?.url || "" }));
    } catch {
      setReportData((prev) => ({ ...prev, imageUrl: "" }));
    } finally {
      setUploading(false);
    }
  };

  const submitReport = async () => {
    if (!reportingItem) return;
    const maxQty = Number(reportingItem.quantity || 0);
    const qty = Number(reportData.quantity || 0);
    if (qty <= 0 || qty > maxQty) return;

    setSubmitting(true);
    try {
      await lossAndDamageApi.create({
        bookingDetailId: null,
        roomInventoryId: reportingItem.id,
        quantity: qty,
        penaltyAmount: Number(reportData.penaltyAmount || 0),
        description: reportData.description || null,
        imageUrl: reportData.imageUrl || null,
      });
      closeReport();
    } finally {
      setSubmitting(false);
    }
  };

  const completeCleaning = async () => {
    try {
      await roomsApi.patchStatus(roomId, "Available");
      navigate("/housekeeping/loss-damage");
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/housekeeping/loss-damage")}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <div className="text-lg font-black text-slate-900">Checklist: {room?.roomNumber || "-"}</div>
            <div className="mt-1 text-[11px] font-black tracking-widest uppercase text-orange-500">
              Trạng thái: Đang kiểm tra
            </div>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-sm hover:bg-emerald-600"
          onClick={completeCleaning}
        >
          Hoàn tất (Sạch sẽ)
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-[12px] font-black tracking-widest uppercase text-slate-800">
            Danh sách đồ đạc:
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent outline-none text-sm font-bold text-slate-700 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh vật tư..."
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[11px] font-black tracking-widest uppercase text-slate-400">
                <th className="text-left px-5 py-4">Tên vật tư</th>
                <th className="text-center px-5 py-4 w-40">Số lượng chuẩn</th>
                <th className="text-right px-5 py-4 w-48">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400 font-bold">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400 font-bold">
                    Không có vật tư nào.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">{item.itemName}</td>
                    <td className="px-5 py-4 text-center font-black text-slate-800">{item.quantity}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openReport(item)}
                        className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600"
                      >
                        Báo hỏng / Mất
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reportingItem ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex items-start justify-between p-6">
              <div>
                <div className="text-sm font-black text-slate-900">
                  Báo hỏng: {String(reportingItem.itemName || "").toUpperCase()}
                </div>
              </div>
              <button type="button" onClick={closeReport} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">
                    * SL hỏng
                  </div>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold outline-none"
                    type="number"
                    min={1}
                    max={Number(reportingItem.quantity || 0)}
                    value={reportData.quantity}
                    onChange={(e) => setReportData((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">
                    * Phạt (VNĐ)
                  </div>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold outline-none"
                    type="number"
                    min={0}
                    value={reportData.penaltyAmount}
                    onChange={(e) => setReportData((p) => ({ ...p, penaltyAmount: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Ghi chú</div>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold outline-none"
                  value={reportData.description}
                  onChange={(e) => setReportData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Nhập ghi chú..."
                />
              </div>

              <div>
                <div className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2">Chụp ảnh</div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <button
                  type="button"
                  className="w-full border border-dashed border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-center gap-2 text-slate-500 font-black text-sm hover:bg-slate-50"
                  onClick={onPickFile}
                  disabled={uploading}
                >
                  <Camera size={16} />
                  {uploading ? "Đang tải ảnh..." : "Mở Camera"}
                </button>

                {reportData.imageUrl ? (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={reportData.imageUrl} alt="evidence" className="w-20 h-14 rounded-2xl object-cover border border-slate-100" />
                    <div className="text-xs text-slate-400 font-bold break-all">{reportData.imageUrl}</div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeReport} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 disabled:opacity-60"
                >
                  {submitting ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

