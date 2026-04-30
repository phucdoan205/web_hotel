import React from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

import HomePage from "../pages/public/HomePage";
import BlogPage from "../pages/public/BlogPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import ActivityPage from "../pages/public/ActivityPage";
import PostDetailPage from "../pages/public/PostDetailPage";
import BlogSearchPage from "../pages/public/BlogSearchPage";
import HotelListPage from "../pages/public/HotelListPage";
import FoodPage from "../pages/public/FoodPage";

import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminRolePermissionsPage from "../pages/admin/AdminRolePermissionsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminBookingPaymentPage from "../pages/admin/AdminBookingPaymentPage";
import AdminCheckInPage from "../pages/admin/AdminCheckInPage";
import AdminInvoiceCreatePage from "../pages/admin/AdminInvoiceCreatePage";
import AdminInvoiceDetailPage from "../pages/admin/AdminInvoiceDetailPage";
import AdminInvoiceListPage from "../pages/admin/AdminInvoiceListPage";
import AdminInvoicePaymentPage from "../pages/admin/AdminInvoicePaymentPage";
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
import AdminAttractionsPage from "../pages/admin/AdminAttractionsPage";
import AdminVoucherPage from "../pages/admin/AdminVoucherPage";

import BookingPage from "../pages/public/BookingPage";
import BookingDetailPage from "../pages/public/BookingDetailPage";
import BookingPaymentPage from "../pages/public/BookingPaymentPage";
import RoomDetailPage from "../pages/public/RoomDetailPage";
import BookingHistoryPage from "../pages/public/BookingHistoryPage";
import AccountPlaceholderPage from "../pages/public/AccountPlaceholderPage";
import AccountProfilePage from "../pages/public/AccountProfilePage";
import AccountFavoritesPage from "../pages/public/AccountFavoritesPage";
import AccountReviewsPage from "../pages/public/AccountReviewsPage";
import PersonalDetailsPage from "../pages/public/account/PersonalDetailsPage";
import SecuritySettingsPage from "../pages/public/account/SecuritySettingsPage";
import GeneralSettingsPage from "../pages/public/account/GeneralSettingsPage";
import RequirePermission from "../components/auth/RequirePermission";

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
        <Route path="booking" element={<BookingPage />} />
        <Route path="booking/:id" element={<BookingDetailPage />} />
        <Route path="booking-history" element={<BookingHistoryPage />} />
        <Route path="booking-history/:id/payment" element={<BookingPaymentPage />} />
        <Route path="room-types/:id" element={<RoomDetailPage />} />
        <Route path="profile" element={<AccountProfilePage />} />
        <Route path="profile/personal-info" element={<PersonalDetailsPage />} />
        <Route path="profile/security" element={<SecuritySettingsPage />} />
        <Route path="profile/settings" element={<GeneralSettingsPage />} />
        <Route path="favorites" element={<AccountFavoritesPage />} />
        <Route path="reviews" element={<AccountReviewsPage />} />
        <Route path="vouchers" element={<AccountPlaceholderPage type="vouchers" />} />
        <Route path="articles" element={<BlogPage />} />
        <Route path="articles/:id" element={<PostDetailPage />} />
        <Route path="articles/search" element={<BlogSearchPage />} />
        <Route path="activities" element={<ActivityPage />} />
        <Route path="hotels/search" element={<HotelListPage />} />
        <Route path="food" element={<FoodPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <RequirePermission permission="VIEW_DASHBOARD">
              <AdminDashboardPage />
            </RequirePermission>
          }
        />
        <Route
          path="dashboard"
          element={
            <RequirePermission permission="VIEW_DASHBOARD">
              <AdminDashboardPage />
            </RequirePermission>
          }
        />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route
          path="settings/roles/new"
          element={
            <RequirePermission permission="CREATE_ROLES">
              <AdminRolePermissionsPage />
            </RequirePermission>
          }
        />
        <Route
          path="settings/roles/:roleId"
          element={
            <RequirePermission permission="EDIT_ROLES">
              <AdminRolePermissionsPage />
            </RequirePermission>
          }
        />
        <Route
          path="audit-log"
          element={
            <RequirePermission permission="VIEW_LOG">
              <AdminAuditLogPage />
            </RequirePermission>
          }
        />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route
          path="bookings"
          element={
            <RequirePermission permission="VIEW_BOOKINGS">
              <AdminBookingsPage />
            </RequirePermission>
          }
        />
        <Route
          path="bookings/:id/payment-qr"
          element={
            <RequirePermission permission="PAY_INVOICE">
              <AdminBookingPaymentPage />
            </RequirePermission>
          }
        />
        <Route
          path="invoices"
          element={
            <RequirePermission permission="VIEW_INVOICES">
              <AdminInvoiceListPage />
            </RequirePermission>
          }
        />
        <Route
          path="invoices/create"
          element={
            <RequirePermission permission="CREATE_INVOICES">
              <AdminInvoiceCreatePage />
            </RequirePermission>
          }
        />
        <Route
          path="invoices/:invoiceId"
          element={
            <RequirePermission permission="VIEW_INVOICES">
              <AdminInvoiceDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="invoices/:invoiceId/payment"
          element={
            <RequirePermission permission="PAY_INVOICE">
              <AdminInvoicePaymentPage />
            </RequirePermission>
          }
        />
        <Route path="check-in-out" element={<Navigate to="/admin/check-in" replace />} />
        <Route
          path="check-in"
          element={
            <RequirePermission permission="CHECKIN_BOOKING">
              <AdminCheckInPage />
            </RequirePermission>
          }
        />
        <Route
          path="stay"
          element={
            <RequirePermission permission="VIEW_BOOKINGS">
              <AdminStayPage />
            </RequirePermission>
          }
        />
        <Route
          path="check-out"
          element={
            <RequirePermission permission="CHECKOUT_BOOKING">
              <AdminCheckOutPage />
            </RequirePermission>
          }
        />
        <Route
          path="room-status"
          element={
            <RequirePermission permission="VIEW_ROOM_TRACKING">
              <AdminRoomStatusPage />
            </RequirePermission>
          }
        />
        <Route
          path="rooms"
          element={
            <RequirePermission permission="VIEW_ROOMS">
              <AdminRoomPage />
            </RequirePermission>
          }
        />
        <Route
          path="room-types"
          element={
            <RequirePermission permission="VIEW_ROOMS">
              <AdminRoomTypesPage />
            </RequirePermission>
          }
        />
        <Route
          path="room-inventory"
          element={
            <RequirePermission permission="VIEW_INVENTORY">
              <AdminRoomInventoryPage />
            </RequirePermission>
          }
        />
        <Route
          path="equipment"
          element={
            <RequirePermission permission="VIEW_INVENTORY">
              <AdminEquipmentPage />
            </RequirePermission>
          }
        />
        <Route
          path="loss-damage"
          element={
            <RequirePermission permission="VIEW_COMPENSATION">
              <AdminLossDamagePage />
            </RequirePermission>
          }
        />
        <Route
          path="pos"
          element={
            <RequirePermission permission="VIEW_SERVICES">
              <AdminPOSServicePage />
            </RequirePermission>
          }
        />
        <Route
          path="staff"
          element={
            <RequirePermission permission="VIEW_USERS">
              <AdminStaffPage />
            </RequirePermission>
          }
        />
        <Route
          path="attractions"
          element={
            <RequirePermission permission="VIEW_ATTRACTIONS">
              <AdminAttractionsPage />
            </RequirePermission>
          }
        />
        <Route
          path="articles"
          element={
            <RequirePermission permission="VIEW_CONTENT">
              <AdminArticlePage />
            </RequirePermission>
          }
        />
        <Route
          path="articles/new"
          element={
            <RequirePermission permission="CREATE_CONTENT">
              <AdminArticleEditorPage />
            </RequirePermission>
          }
        />
        <Route
          path="articles/:id/edit"
          element={
            <RequirePermission permission="EDIT_CONTENT">
              <AdminArticleEditorPage />
            </RequirePermission>
          }
        />
        <Route
          path="vouchers"
          element={
            <RequirePermission permission="VIEW_VOUCHERS">
              <AdminVoucherPage />
            </RequirePermission>
          }
        />
        <Route
          path="housekeeping/tasks"
          element={
            <RequirePermission permission="VIEW_HOUSEKEEPING">
              <AdminHousekeepingTasksPage />
            </RequirePermission>
          }
        />
        <Route
          path="housekeeping/tasks/:roomId"
          element={
            <RequirePermission permission="VIEW_HOUSEKEEPING">
              <AdminHousekeepingTaskDetailPage />
            </RequirePermission>
          }
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
