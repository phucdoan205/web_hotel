import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BookingFilters from "../../components/receptionist/bookings/BookingFilters";
import BookingTable from "../../components/receptionist/bookings/BookingTable";
import BookingCreateModal from "../../components/receptionist/bookings/BookingCreateModal";
import { roomTypesApi } from "../../api/admin/roomTypesApi";

const initialFilters = {
  search: "",
  status: "",
  roomTypeId: "",
  checkInFrom: "",
  checkInTo: "",
  page: 1,
  pageSize: 10,
};

const ReceptionistBookingsPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [screenNotice, setScreenNotice] = useState(null);

  const { data: roomTypesResponse } = useQuery({
    queryKey: ["roomTypes", { page: 1, pageSize: 100 }],
    queryFn: () => roomTypesApi.getRoomTypes({ page: 1, pageSize: 100 }),
  });

  useEffect(() => {
    if (!screenNotice) return undefined;

    const timer = window.setTimeout(() => {
      setScreenNotice(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [screenNotice]);

  const handleFilterChange = (key, value) => {
    if (key === "checkInDate") {
      setFilters((prev) => ({
        ...prev,
        checkInFrom: value,
        checkInTo: value,
        page: 1,
      }));
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const roomTypes = roomTypesResponse?.items ?? [];

  return (
    <div className="space-y-4 px-4 py-2">
      {screenNotice ? (
        <div className="sticky top-20 z-30">
          <div
            className={`mx-auto flex max-w-3xl items-start justify-between gap-4 rounded-3xl border px-5 py-4 shadow-lg ${
              screenNotice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <div className="flex items-start gap-3">
              {screenNotice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
              ) : (
                <AlertTriangle className="mt-0.5 text-amber-600" size={22} />
              )}
              <div>
                <p className="font-bold">{screenNotice.title}</p>
                <p className="text-sm">{screenNotice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScreenNotice(null)}
              className="rounded-xl p-2 transition hover:bg-white/70"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Quản lý Booking</h1>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Xem và quản lý tất cả đặt phòng của khách hàng
        </p>
      </div>

      <BookingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onClearFilters={() => setFilters(initialFilters)}
        roomTypes={roomTypes}
      />

      <BookingTable filters={filters} onPageChange={handlePageChange} />

      <BookingCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onNotice={setScreenNotice}
      />
    </div>
  );
};

export default ReceptionistBookingsPage;
