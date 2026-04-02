import { BedDouble } from "lucide-react";

const statusMap = {
  Occupied: { label: "Đang có khách", dot: "dotGreen" },
  Cleaning: { label: "Đang dọn dẹp", dot: "dotOrange" },
  Available: { label: "Phòng trống", dot: "dotGray" },
};

export default function RoomCard({ room, onClick }) {
  const status = statusMap[room.status] || { label: room.status || "", dot: "dotGray" };
  const type = (room.roomTypeName || "").toUpperCase();
  const badgeClass =
    type === "VIP"
      ? "bg-amber-50 text-amber-600"
      : "bg-blue-50 text-blue-600";
  const dotClass =
    status.dot === "dotGreen"
      ? "bg-emerald-500"
      : status.dot === "dotOrange"
        ? "bg-orange-500"
        : "bg-slate-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="absolute top-5 right-5 opacity-10 text-slate-900">
        <BedDouble size={60} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="text-4xl font-black text-slate-900">{room.roomNumber}</div>
        {type ? (
          <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${badgeClass}`}>
            {type}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
        <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          {status.label}
        </div>
      </div>
    </button>
  );
}
