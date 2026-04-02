import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { inventoryApi } from "../../api/inventoryApi";
import { roomsApi } from "../../api/roomsApi";

export default function HousekeepingInventoryRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/housekeeping/inventory")}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <div className="text-lg font-black text-slate-900">Vật tư phòng: {room?.roomNumber || "-"}</div>
            <div className="mt-1 text-[11px] font-black tracking-widest uppercase text-orange-500">
              Quyền: Chỉ xem
            </div>
          </div>
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

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-[11px] font-black tracking-widest uppercase text-slate-400">
                <th className="text-left px-5 py-4">Tên vật tư</th>
                <th className="text-center px-5 py-4 w-40">Số lượng</th>
                <th className="text-right px-5 py-4 w-48">Giá đền bù</th>
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
                    Không có vật tư.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">{item.itemName}</td>
                    <td className="px-5 py-4 text-center font-black text-slate-800">{item.quantity}</td>
                    <td className="px-5 py-4 text-right font-black text-rose-500">
                      {Number(item.priceIfLost || 0).toLocaleString()}đ
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
