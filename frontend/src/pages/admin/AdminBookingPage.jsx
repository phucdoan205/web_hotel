import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, CircleDollarSign, Layers3, UserRound } from "lucide-react";
import { roomsApi } from "../../api/admin/roomsApi";
import { bookingsApi } from "../../api/admin/bookingsApi";
import { formatVietnamDate } from "../../utils/vietnamTime";

const priceFormatter = new Intl.NumberFormat("vi-VN");

const bookingPriority = {
  CheckedIn: 4,
  Confirmed: 3,
  Pending: 2,
  Paid: 2,
  Unpaid: 1,
};

const statusStyles = {
  Available: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Occupied: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Cleaning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Maintenance: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  OutOfOrder: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const bookingStateStyles = {
  "Đã có khách đặt": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  "Chưa có ai đặt": "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const isActiveBooking = (booking) =>
  !["Cancelled", "Completed"].includes(booking?.status);

const getBookingPriority = (status) => bookingPriority[status] ?? 0;

const getRoomBookingMap = (bookings) => {
  const roomMap = new Map();

  bookings
    .filter(isActiveBooking)
    .forEach((booking) => {
      (booking.bookingDetails ?? []).forEach((detail) => {
        if (!detail.roomId) return;

        const current = roomMap.get(detail.roomId);
        const nextEntry = {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          bookingStatus: booking.status,
          guestName: booking.guestName || detail.guestName || "Khách chưa rõ tên",
          checkInDate: detail.checkInDate,
          checkOutDate: detail.checkOutDate,
        };

        if (
          !current ||
          getBookingPriority(booking.status) > getBookingPriority(current.bookingStatus)
        ) {
          roomMap.set(detail.roomId, nextEntry);
        }
      });
    });

  return roomMap;
};

const formatDate = (value) => {
  if (!value) return "--";
  return formatVietnamDate(value);
};

const getFloorLabel = (floor) => {
  if (floor === null || floor === undefined) return "Chưa gán tầng";
  return `Tầng ${floor}`;
};

const getRoomDisplayName = (room) => {
  if (room.roomTypeName) {
    return room.roomTypeName;
  }

  return `Phòng ${room.roomNumber}`;
};

export default function AdminBookingPage() {
  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["admin-booking-room-overview", "rooms"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 300 }),
  });

  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["admin-booking-room-overview", "bookings"],
    queryFn: () => bookingsApi.getBookings({ page: 1, pageSize: 500 }),
  });

  const rooms = roomsResponse?.items ?? [];
  const bookings = bookingsResponse?.items ?? bookingsResponse?.Items ?? [];

  const roomBookingMap = useMemo(() => getRoomBookingMap(bookings), [bookings]);

  const roomGroups = useMemo(() => {
    return rooms
      .map((room) => {
        const booking = roomBookingMap.get(room.id);
        return {
          ...room,
          activeBooking: booking ?? null,
          bookingState: booking ? "Đã có khách đặt" : "Chưa có ai đặt",
        };
      })
      .sort((a, b) => {
        const floorA = a.floor ?? Number.MAX_SAFE_INTEGER;
        const floorB = b.floor ?? Number.MAX_SAFE_INTEGER;

        if (floorA !== floorB) return floorA - floorB;
        return String(a.roomNumber).localeCompare(String(b.roomNumber), "vi");
      })
      .reduce((groups, room) => {
        const key = room.floor ?? "unknown";

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(room);
        return groups;
      }, {});
  }, [roomBookingMap, rooms]);

  const floorEntries = useMemo(
    () =>
      Object.entries(roomGroups).sort(([floorA], [floorB]) => {
        if (floorA === "unknown") return 1;
        if (floorB === "unknown") return -1;
        return Number(floorA) - Number(floorB);
      }),
    [roomGroups],
  );

  const totalRooms = rooms.length;
  const bookedRooms = rooms.filter((room) => roomBookingMap.has(room.id)).length;

  const isLoading = roomsLoading || bookingsLoading;
  const error = roomsError || bookingsError;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Theo dõi phòng theo tầng
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Màn hình này chỉ hiển thị thông tin phòng, giá, trạng thái và tình trạng
              booking hiện tại. Không có thao tác chỉnh sửa hoặc đặt phòng.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Tổng phòng
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">{totalRooms}</p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                Đã có booking
              </p>
              <p className="mt-1 text-2xl font-black text-orange-700">{bookedRooms}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Chưa có booking
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {Math.max(totalRooms - bookedRooms, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          Không tải được dữ liệu phòng hoặc booking. {error.message || ""}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-[28px] border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : floorEntries.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-black text-slate-900">Chưa có phòng để hiển thị</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Khi có dữ liệu phòng, hệ thống sẽ tự nhóm theo từng tầng tại đây.
          </p>
        </div>
      ) : (
        floorEntries.map(([floorKey, floorRooms]) => (
          <section
            key={floorKey}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <Layers3 className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {getFloorLabel(
                      floorKey === "unknown" ? null : Number(floorKey),
                    )}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    {floorRooms.length} phòng đang được theo dõi
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {floorRooms.map((room) => (
                <article
                  key={room.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        Phòng {room.roomNumber}
                      </p>
                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        {getRoomDisplayName(room)}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        statusStyles[room.status] ?? statusStyles.OutOfOrder
                      }`}
                    >
                      {room.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CircleDollarSign className="size-4 text-orange-500" />
                      {priceFormatter.format(room.basePrice || 0)} đ / đêm
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <BedDouble className="size-4 text-sky-500" />
                      {room.roomTypeName || "Chưa có loại phòng"}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <UserRound className="size-4 text-emerald-500" />
                      {room.activeBooking?.guestName || "Chưa có khách"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.activeBooking ? (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                          bookingStateStyles[room.bookingState]
                        }`}
                      >
                        {room.bookingState}
                      </span>
                    ) : null}
                    {room.cleaningStatus ? (
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                        Trạng thái dọn phòng: {room.cleaningStatus}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
                    {room.activeBooking ? (
                      <div className="space-y-1 text-sm">
                        <p className="font-black text-slate-900">
                          Mã booking: {room.activeBooking.bookingCode}
                        </p>
                        <p className="font-semibold text-slate-600">
                          Booking: {room.activeBooking.bookingStatus}
                        </p>
                        <p className="font-medium text-slate-500">
                          {formatDate(room.activeBooking.checkInDate)} -{" "}
                          {formatDate(room.activeBooking.checkOutDate)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-500">
                        Phòng này hiện chưa có ai đặt
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
