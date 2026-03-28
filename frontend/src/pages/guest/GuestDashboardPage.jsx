import React from "react";
import {
  Edit3,
  Calendar,
  Flame,
  Ticket,
  MessageSquare,
  History,
} from "lucide-react";
import StatsCards from "../../components/guest/dashboard/StatsCards";
import UpcomingBooking from "../../components/guest/dashboard/UpcomingBooking";
import Recommendation from "../../components/guest/dashboard/Recommendation";
import VoucherList from "../../components/guest/dashboard/VoucherList";
import RecentHistory from "../../components/guest/dashboard/RecentHistory";
import RecentReviews from "../../components/guest/dashboard/RecentReviews";

const GuestDashboardPage = () => {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* 1. Header: Chào mừng và nút chỉnh sửa */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome back, Nguyen Van A!
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Manage your bookings and travel rewards here.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0085FF] text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:scale-105 transition-all">
          <Edit3 size={14} /> Edit Profile
        </button>
      </header>

      {/* 2. Stat Cards Section */}
      <StatsCards />

      {/* 3. Main Content Grid (12 Columns) */}
      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN (8/12): Booking & History */}
        <div className="col-span-8 space-y-10">
          {/* Upcoming Booking Section */}
          <section>
            <UpcomingBooking />
          </section>

          {/* Recommendations Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
                  <Flame size={16} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                  Recommended for You
                </h2>
              </div>
              <button className="text-[10px] font-black text-[#0085FF] hover:underline uppercase">
                View All
              </button>
            </div>
            <Recommendation />
          </section>

          {/* Recent History Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <History size={16} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Recent History
              </h2>
            </div>
            <RecentHistory />
          </section>
        </div>

        {/* RIGHT COLUMN (4/12): Vouchers & Reviews */}
        <div className="col-span-4 space-y-10">
          {/* Vouchers Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Ticket size={16} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                My Vouchers
              </h2>
            </div>
            <VoucherList />
          </section>

          {/* Recent Reviews Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-500">
                <MessageSquare size={16} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">
                Recent Reviews
              </h2>
            </div>
            <RecentReviews />
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboardPage;
