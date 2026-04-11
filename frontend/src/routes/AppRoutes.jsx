import React from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import GuestLayout from "../layouts/GuestLayout";

import HomePage from "../pages/public/HomePage";
import BlogPage from "../pages/public/BlogPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ActivityPage from "../pages/public/ActivityPage";
import PostDetailPage from "../pages/public/PostDetailPage";
import BlogSearchPage from "../pages/public/BlogSearchPage";
import HotelListPage from "../pages/public/HotelListPage";
import FoodPage from "../pages/public/FoodPage";

import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminBookingPaymentPage from "../pages/admin/AdminBookingPaymentPage";
import AdminCheckInPage from "../pages/admin/AdminCheckInPage";
import AdminStayPage from "../pages/admin/AdminStayPage";
import AdminCheckOutPage from "../pages/admin/AdminCheckOutPage";
import AdminPOSServicePage from "../pages/admin/AdminPOSServicePage";
import AdminRoomInventoryPage from "../pages/admin/AdminRoomInventoryPage";
import AdminRoomStatusPage from "../pages/admin/AdminRoomStatusPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminEquipmentPage from "../pages/admin/AdminEquipmentPage";
import AdminHousekeepingTaskDetailPage from "../pages/admin/AdminHousekeepingTaskDetailPage";
import AdminHousekeepingTasksPage from "../pages/admin/AdminHousekeepingTasksPage";
import AdminLossDamagePage from "../pages/admin/AdminLossDamagePage";
import AdminRoomPage from "../pages/admin/AdminRoomPage";
import AdminRoomTypesPage from "../pages/admin/AdminRoomTypesPage";
import AdminArticlePage from "../pages/admin/AdminArticlePage";
import AdminArticleEditorPage from "../pages/admin/AdminArticleEditorPage";
import AdminVoucherPage from "../pages/admin/AdminVoucherPage";

import GuestSettingsPage from "../pages/guest/GuestSettingsPage";
import GuestDashboardPage from "../pages/guest/GuestDashboardPage";
import GuestMyBookingsPage from "../pages/guest/GuestMyBookingsPage";
import GuestMyReviewsPage from "../pages/guest/GuestMyReviewsPage";
import GuestInRoomDiningPage from "../pages/guest/GuestInRoomDiningPage";
import GuestBookingDetailPage from "../pages/guest/GuestBookingDetailPage";
import GuestPaymentMethodsPage from "../pages/guest/GuestPaymentMethodsPage";
import GuestVoucherPage from "../pages/guest/GuestVoucherPage";
import GuestMyFavoritesPage from "../pages/guest/GuestMyFavoritesPage";
import GuestCustomerSupportPage from "../pages/guest/GuestCustomerSupportPage";

const AppRoutes = () => {
  function RedirectReceptionistBookingPayment() {
    const { id } = useParams();
    const location = useLocation();
    return <Navigate to={`/admin/bookings/${id}/payment-qr${location.search}`} replace />;
  }

  function RedirectLegacyHousekeepingTask() {
    const { roomId } = useParams();
    return (
      <Navigate
        to={roomId ? `/admin/housekeeping/tasks/${roomId}` : "/admin/housekeeping/tasks"}
        replace
      />
    );
  }

  return (
    <Routes>
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

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="audit-log" element={<AdminAuditLogPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="bookings/:id/payment-qr" element={<AdminBookingPaymentPage />} />
        <Route path="check-in-out" element={<Navigate to="/admin/check-in" replace />} />
        <Route path="check-in" element={<AdminCheckInPage />} />
        <Route path="stay" element={<AdminStayPage />} />
        <Route path="check-out" element={<AdminCheckOutPage />} />
        <Route path="room-status" element={<AdminRoomStatusPage />} />
        <Route path="rooms" element={<AdminRoomPage />} />
        <Route path="room-types" element={<AdminRoomTypesPage />} />
        <Route path="room-inventory" element={<AdminRoomInventoryPage />} />
        <Route path="equipment" element={<AdminEquipmentPage />} />
        <Route path="loss-damage" element={<AdminLossDamagePage />} />
        <Route path="pos" element={<AdminPOSServicePage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="articles" element={<AdminArticlePage />} />
        <Route path="articles/new" element={<AdminArticleEditorPage />} />
        <Route path="articles/:id/edit" element={<AdminArticleEditorPage />} />
        <Route path="vouchers" element={<AdminVoucherPage />} />
        <Route path="housekeeping/tasks" element={<AdminHousekeepingTasksPage />} />
        <Route
          path="housekeeping/tasks/:roomId"
          element={<AdminHousekeepingTaskDetailPage />}
        />
      </Route>

      <Route
        path="/receptionist/bookings/:id/payment-qr"
        element={<RedirectReceptionistBookingPayment />}
      />
      <Route path="/receptionist/*" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/housekeeping/tasks/:roomId" element={<RedirectLegacyHousekeepingTask />} />
      <Route path="/housekeeping/tasks" element={<RedirectLegacyHousekeepingTask />} />
      <Route path="/housekeeping/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<GuestDashboardPage />} />
        <Route path="dashboard" element={<GuestDashboardPage />} />
        <Route path="bookings" element={<GuestMyBookingsPage />} />
        <Route path="reviews" element={<GuestMyReviewsPage />} />
        <Route path="dining" element={<GuestInRoomDiningPage />} />
        <Route path="booking/:id" element={<GuestBookingDetailPage />} />
        <Route path="payments" element={<GuestPaymentMethodsPage />} />
        <Route path="vouchers" element={<GuestVoucherPage />} />
        <Route path="favorites" element={<GuestMyFavoritesPage />} />
        <Route path="support" element={<GuestCustomerSupportPage />} />
        <Route path="settings" element={<GuestSettingsPage />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="flex h-screen items-center justify-center font-bold text-2xl">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
