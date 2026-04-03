import React from "react";
import { Download, Plus } from "lucide-react";
import BookingStats from "../../components/admin/bookings/BookingStats";
import BookingFilters from "../../components/admin/bookings/BookingFilters";
import BookingList from "../../components/admin/bookings/BookingList";

const AdminBookingPage = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Booking Management
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Efficiently manage and monitor all reservations across your
            properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download className="size-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 rounded-xl text-sm font-bold text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
            <Plus className="size-4 text-white" />
            New Booking
          </button>
        </div>
      </div>

      <BookingStats />
      <BookingFilters />
      <BookingList />
    </div>
  );
};

export default AdminBookingPage;
