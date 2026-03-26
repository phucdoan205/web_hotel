import React from "react";
import { ShoppingBag, DollarSign, BedDouble, Users } from "lucide-react";
import StatCard from "../../components/admin/dashboard/StatCard";
import BookingTable from "../../components/admin/dashboard/BookingTable";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import RoomChart from "../../components/admin/dashboard/RoomChart";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value="1,284"
          trend={12.5}
          icon={ShoppingBag}
          colorClass="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Today's Revenue"
          value="$12,450.00"
          trend={8.2}
          icon={DollarSign}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Occupancy Rate"
          value="88.4%"
          trend={-2.4}
          icon={BedDouble}
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Current Guests"
          value="156"
          trend={5.1}
          icon={Users}
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <RoomChart />
        </div>
      </div>

      {/* Table Section */}
      <BookingTable />

      <footer className="text-center text-xs text-gray-400 pt-10 pb-4">
        © 2026 Traveloka ERP. All Rights Reserved. Version 2.1.0-Stable
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
