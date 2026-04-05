// src/pages/receptionist/ReceptionistBookingsPage.jsx
import { useState } from "react";
import BookingFilters from "../../components/receptionist/bookings/BookingFilters";
import BookingTable from "../../components/receptionist/bookings/BookingTable";
import BookingCreateModal from "../../components/receptionist/bookings/BookingCreateModal";

const ReceptionistBookingsPage = (open) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    roomTypeId: "",
    checkInFrom: "",
    checkInTo: "",
    page: 1,
    pageSize: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // reset về trang 1 khi thay đổi filter
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Quản lý Booking
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Xem và quản lý tất cả đặt phòng của khách hàng
        </p>
      </div>

      <BookingFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onOpenCreate={() => setIsCreateModalOpen(true)} 
      />

      <BookingTable 
        filters={filters} 
        onPageChange={handlePageChange} 
      />

      <BookingCreateModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default ReceptionistBookingsPage;