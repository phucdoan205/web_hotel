import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Pages landings   
import HomePage from "../pages/public/HomePage";
import BlogPage from "../pages/public/BlogPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ActivityPage from "../pages/public/ActivityPage";
import PostDetailPage from "../pages/public/PostDetailPage";
import BlogSearchPage from "../pages/public/BlogSearchPage";
import HotelListPage from "../pages/public/HotelListPage";
import FoodPage from "../pages/public/FoodPage";

// Pages admin
import SettingsPage from "../pages/admin/SettingsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import AuditLogPage from "../pages/admin/AuditLogPage";
import ReportsPage from "../pages/admin/ReportsPage";
import BookingPage from "../pages/admin/BookingPage";
import RoomInventoryPage from "../pages/admin/RoomInventoryPage";
import StaffPage from "../pages/admin/StaffPage";



const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes dùng MainLayout (Có Navbar/Footer) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="hotels" element={<HomePage />} />
        <Route path="hotels/:id" element={<HotelListPage />} />
        <Route path="articles" element={<BlogPage />} />
        <Route path="articles/:id" element={<PostDetailPage />} />
        <Route path="articles/search" element={<BlogSearchPage />} />
        <Route path="activities" element={<ActivityPage />} />
        <Route path="hotels/search" element={<HotelListPage />} />
        <Route path="food" element={<FoodPage />} />
      </Route>

      {/* 2. Auth Routes (Không dùng chung Layout Landing) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 3. Admin Routes (Dùng AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="room-inventory" element={<RoomInventoryPage />} />
        <Route path="staff" element={<StaffPage />} />
      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen font-bold text-2xl">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
