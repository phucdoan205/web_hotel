import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownWideNarrow } from "lucide-react";
import BookingFilter from "../../components/user/bookings/BookingFilter";
import BookingCard from "../../components/user/bookings/BookingCard";
import { roomsApi } from "../../api/admin/roomsApi";

const DEFAULT_CHECK_IN_HOUR = 14;
const DEFAULT_CHECK_OUT_HOUR = 12;

const createDefaultDateTime = (offsetDays, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const toDateTimeInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toApiDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const calculateStayDays = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 1;
  }

  const diffInMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

const buildQueryParams = (filters) => ({
  checkIn: toApiDate(filters.checkIn),
  checkOut: toApiDate(filters.checkOut),
  adults: filters.adults,
  children: filters.children,
  page: 1,
  pageSize: 50,
});

const sortRooms = (rooms, sortBy, numberOfNights) => {
  const nextRooms = [...rooms];

  nextRooms.sort((left, right) => {
    const leftTotal = (left.basePrice || 0) * Math.max(1, numberOfNights);
    const rightTotal = (right.basePrice || 0) * Math.max(1, numberOfNights);

    if (sortBy === "price-asc") return leftTotal - rightTotal;
    if (sortBy === "price-desc") return rightTotal - leftTotal;
    return (left.roomNumber || "").localeCompare(right.roomNumber || "", "vi");
  });

  return nextRooms;
};

const createDefaultFilters = () => ({
  checkIn: toDateTimeInputValue(createDefaultDateTime(0, DEFAULT_CHECK_IN_HOUR)),
  checkOut: toDateTimeInputValue(createDefaultDateTime(1, DEFAULT_CHECK_OUT_HOUR)),
  adults: 1,
  children: 0,
});

const UserBookingsPage = () => {
  const [filters, setFilters] = useState(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState("price-asc");

  const stayDays = useMemo(
    () => calculateStayDays(appliedFilters.checkIn, appliedFilters.checkOut),
    [appliedFilters.checkIn, appliedFilters.checkOut],
  );

  const availableRoomsQuery = useQuery({
    queryKey: ["user-available-rooms", appliedFilters],
    queryFn: () => roomsApi.getAvailableRooms(buildQueryParams(appliedFilters)),
  });

  const rooms = availableRoomsQuery.data?.items ?? [];

  const availableCountByType = useMemo(() => {
    const map = new Map();

    rooms.forEach((room) => {
      const key = room.roomTypeName || room.roomTypeId || room.id;
      map.set(key, (map.get(key) || 0) + 1);
    });

    return map;
  }, [rooms]);

  const sortedRooms = useMemo(
    () => sortRooms(rooms, sortBy, stayDays),
    [rooms, sortBy, stayDays],
  );

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    const defaultFilters = createDefaultFilters();
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <div className="-mx-2 min-h-screen rounded-[36px] bg-[#eef3f9] p-5 lg:-mx-4 lg:p-8 2xl:-mx-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="order-2 xl:order-1">
          <div className="mb-5 flex items-center justify-end rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ArrowDownWideNarrow size={16} className="text-slate-400" />
              <label className="text-sm font-semibold text-slate-500">
                Giá theo:
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="price-asc">Tổng giá tiền tăng dần</option>
                <option value="price-desc">Tổng giá tiền giảm dần</option>
                <option value="room-number">Số phòng</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {availableRoomsQuery.isLoading ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500">
                Đang tải danh sách phòng trống...
              </div>
            ) : null}

            {availableRoomsQuery.isError ? (
              <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-8 text-sm font-semibold text-rose-600">
                Không tải được danh sách phòng. Vui lòng thử lại.
              </div>
            ) : null}

            {!availableRoomsQuery.isLoading && !availableRoomsQuery.isError && sortedRooms.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h3 className="text-xl font-bold text-slate-900">Không tìm thấy phòng phù hợp</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Thử đổi ngày nhận, ngày trả hoặc số lượng khách để xem thêm phòng trống.
                </p>
              </div>
            ) : null}

            {sortedRooms.map((room) => {
              const roomTypeKey = room.roomTypeName || room.roomTypeId || room.id;

              return (
                <BookingCard
                  key={room.id}
                  room={room}
                  numberOfNights={stayDays}
                  availableCount={availableCountByType.get(roomTypeKey) || 1}
                  detailLinkState={{
                    room,
                    filters: appliedFilters,
                    numberOfNights: stayDays,
                  }}
                />
              );
            })}
          </div>
        </section>

        <aside className="order-1 xl:order-2">
          <div className="sticky top-24">
            <BookingFilter
              filters={filters}
              onChange={handleFilterChange}
              onSubmit={handleSearch}
              onClear={handleClearFilters}
              isSearching={availableRoomsQuery.isFetching}
              numberOfNights={calculateStayDays(filters.checkIn, filters.checkOut)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserBookingsPage;
