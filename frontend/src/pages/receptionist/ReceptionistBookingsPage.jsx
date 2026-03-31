import React from "react";
import BookingFilters from "../../components/receptionist/bookings/BookingFilters";
import BookingTable from "../../components/receptionist/bookings/BookingTable";

const ReceptionistBookingsPage = () => {
  return (
    <div className="p-8 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Bookings Management
        </h1>
        <p className="text-sm font-bold text-gray-400 mt-1">
          View and manage all guest reservations.
        </p>
      </div>

      {/* Search & Action Bar */}
      <BookingFilters />

      {/* Main Data Table */}
      <BookingTable />
    </div>
  );
};

export default ReceptionistBookingsPage;
