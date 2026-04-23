import React from "react";
import BookingFilter from "../../components/user/bookings/BookingFilter";
import BookingCard from "../../components/user/bookings/BookingCard";
import { Search, Plus, HelpCircle } from "lucide-react";

const UserBookingsPage = ({ onViewDetail }) => {
  const mockBookings = [
    {
      id: "TRV-8829102",
      hotel: "The Ritz-Carlton Jakarta",
      status: "Confirmed",
      price: "4.520.000",
      date: "12 Oct - 15 Oct 2023",
      type: "Deluxe King Room",
      guests: "2 Adults",
      img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    },
    {
      id: "TRV-7718290",
      hotel: "Alila Seminyak Bali",
      status: "Completed",
      price: "8.120.000",
      date: "20 Aug - 23 Aug 2023",
      type: "Ocean View Suite",
      guests: "2 Adults",
      img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    },
  ];

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          My Bookings
        </h1>
        <button className="bg-[#0085FF] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 max-w-md relative ml-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search booking ID or hotel name..."
            className="w-full pl-10 pr-4 py-2 text-[11px] font-bold bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      <div className="space-y-10">
        <BookingFilter />
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {mockBookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => onViewDetail(booking.id)}
            className="cursor-pointer"
          >
            <BookingCard data={booking} />
          </div>
        ))}
      </div>

      {/* Support Banner */}
      <div className="mt-12 bg-blue-50/40 border border-dashed border-blue-200 p-8 rounded-[2.5rem] flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="size-14 bg-white rounded-2xl flex items-center justify-center text-[#0085FF] shadow-sm">
            <HelpCircle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">
              Need help with your booking?
            </h4>
            <p className="text-[11px] font-bold text-gray-400 mt-0.5">
              Our customer support team is available 24/7 to assist you with any
              inquiries.
            </p>
          </div>
        </div>
        <button className="bg-[#0085FF] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-colors">
          Contact Support
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-12 flex justify-between items-center text-[10px] font-bold text-gray-300 border-t border-gray-100 pt-6">
        <p>© 2023 Traveloka. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-gray-500 cursor-pointer">
            Terms of Service
          </span>
          <span className="hover:text-gray-500 cursor-pointer">
            Privacy Policy
          </span>
          <span className="hover:text-gray-500 cursor-pointer">
            Cookie Policy
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserBookingsPage;
