import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../../components/RoomCard";
import { roomsApi } from "../../api/roomsApi";

export default function HousekeepingInventoryRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await roomsApi.getAll();
        const list = res.data?.items ?? res.data ?? [];
        if (!cancelled) setRooms(list);
      } catch {
        if (!cancelled) setError("Không thể tải danh sách phòng.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-black text-slate-900">Quản lý vật tư</div>
        <div className="mt-1 text-[11px] font-black tracking-widest uppercase text-slate-400">
          Chọn phòng để xem vật tư (Housekeeping chỉ xem)
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-4 py-3 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-[132px] rounded-3xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={() => navigate(`/housekeeping/inventory/${room.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
