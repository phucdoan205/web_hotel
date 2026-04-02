import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ReceptionistLayout from "../layouts/ReceptionistLayout";
import HousekeepingLayout from "../layouts/HousekeepingLayout";
import GuestLayout from "../layouts/GuestLayout";

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
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import AdminBookingPage from "../pages/admin/AdminBookingPage";
import AdminRoomInventoryPage from "../pages/admin/AdminRoomInventoryPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";

// Pages receptionist
import ReceptionistCheckInOutPage from "../pages/receptionist/ReceptionistCheckInOutPage";
import ReceptionistBookingsPage from "../pages/receptionist/ReceptionistBookingsPage";
import ReceptionistContentManagementPage from "../pages/receptionist/ReceptionistContentManagementPage";
import ReceptionistGuestManagementPage from "../pages/receptionist/ReceptionistGuestManagementPage";
import ReceptionistReportsPage from "../pages/receptionist/ReceptionistReportsPage";
import ReceptionistRoomStatusPage from "../pages/receptionist/ReceptionistRoomStatusPage";
import ReceptionistSettingsPage from "../pages/receptionist/ReceptionistSettingsPage";
import ReceptionistPOSServicePage from "../pages/receptionist/ReceptionistPOSServicePage";
import ReceptionistDashboardPage from "../pages/receptionist/ReceptionistDashboardPage";
import ReceptionistInventoryRoomsPage from "../pages/receptionist/ReceptionistInventoryRoomsPage";
import ReceptionistInventoryRoomPage from "../pages/receptionist/ReceptionistInventoryRoomPage";
import ReceptionistLossDamagePage from "../pages/receptionist/ReceptionistLossDamagePage";

// Pages housekeeping
import HousekeepingSettingsPage from "../pages/housekeeping/HousekeepingSettingsPage";
import HousekeepingDashboardPage from "../pages/housekeeping/HousekeepingDashboardPage";
import HousekeepingRoomListPage from "../pages/housekeeping/HousekeepingRoomListPage";
import HousekeepingRoomInspectionDetailPage from "../pages/housekeeping/HousekeepingRoomInspectionDetailPage";
import HousekeepingReportsPage from "../pages/housekeeping/HousekeepingReportsPage";
import HousekeepingTasksPage from "../pages/housekeeping/HousekeepingTasksPage";
import HousekeepingInventoryManagementPage from "../pages/housekeeping/HousekeepingInventoryManagementPage";
import HousekeepingStaffManagementPage from "../pages/housekeeping/HousekeepingStaffManagementPage";
import HousekeepingInventoryRoomsPage from "../pages/housekeeping/HousekeepingInventoryRoomsPage";
import HousekeepingInventoryRoomPage from "../pages/housekeeping/HousekeepingInventoryRoomPage";
import HousekeepingLossDamageRoomsPage from "../pages/housekeeping/HousekeepingLossDamageRoomsPage";
import HousekeepingLossDamageChecklistPage from "../pages/housekeeping/HousekeepingLossDamageChecklistPage";

// Pages guest
import GuestSettingsPage from "../pages/guest/GuestSettingsPage";
import GuestDashboardPage from "../pages/guest/GuestDashboardPage";
import GuestMyBookingsPage from "../pages/guest/GuestMyBookingsPage";
import GuestMyReviewsPage from "../pages/guest/GuestMyReviewsPage";
import GuestInRoomDiningPage from "../pages/guest/GuestInRoomDiningPage";
import GuestBookingDetailPage from "../pages/guest/GuestBookingDetailPage";;
import GuestPaymentMethodsPage from "../pages/guest/GuestPaymentMethodsPage";
import GuestVoucherPage from "../pages/guest/GuestVoucherPage";
import GuestMyFavoritesPage from "../pages/guest/GuestMyFavoritesPage";
import GuestCustomerSupportPage from "../pages/guest/GuestCustomerSupportPage";


// AppRoutes định nghĩa tất cả các route của ứng dụng, phân chia rõ ràng giữa các loại người dùng và layout tương ứng
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
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="audit-log" element={<AdminAuditLogPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="bookings" element={<AdminBookingPage />} />
        <Route path="room-inventory" element={<AdminRoomInventoryPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
      </Route>

      {/* 4. Receptionist Routes (Dùng ReceptionistLayout) */}
      <Route path="/receptionist" element={<ReceptionistLayout />}>
        <Route index element={<ReceptionistDashboardPage />} />
        <Route path="dashboard" element={<ReceptionistDashboardPage />} />
        <Route path="check-in-out" element={<ReceptionistCheckInOutPage />} />
        <Route path="bookings" element={<ReceptionistBookingsPage />} />
        <Route path="posts" element={<ReceptionistContentManagementPage />} />
        <Route path="guests" element={<ReceptionistGuestManagementPage />} />
        <Route path="reports" element={<ReceptionistReportsPage />} />
        <Route path="room-status" element={<ReceptionistRoomStatusPage />} />
        <Route path="inventory" element={<ReceptionistInventoryRoomsPage />} />
        <Route path="inventory/:roomId" element={<ReceptionistInventoryRoomPage />} />
        <Route path="loss-damage" element={<ReceptionistLossDamagePage />} />
        <Route path="settings" element={<ReceptionistSettingsPage />} />
        <Route path="pos" element={<ReceptionistPOSServicePage />} />
      </Route>

      {/* 5. Housekeeping Routes (Dùng HousekeepingLayout) */}
      <Route path="/housekeeping" element={<HousekeepingLayout />}>
        <Route index element={<HousekeepingDashboardPage />} />
        <Route path="dashboard" element={<HousekeepingDashboardPage />} />
        <Route path="rooms" element={<HousekeepingRoomListPage />} />
        <Route path="inspections" element={<HousekeepingRoomInspectionDetailPage />} />
        <Route path="reports" element={<HousekeepingReportsPage />} />
        <Route path="tasks" element={<HousekeepingTasksPage />} />
        <Route path="inventory" element={<HousekeepingInventoryRoomsPage />} />
        <Route path="inventory/:roomId" element={<HousekeepingInventoryRoomPage />} />
        <Route path="inventory-management" element={<HousekeepingInventoryManagementPage />} />
        <Route path="loss-damage" element={<HousekeepingLossDamageRoomsPage />} />
        <Route path="loss-damage/:roomId" element={<HousekeepingLossDamageChecklistPage />} />
        <Route path="staff" element={<HousekeepingStaffManagementPage />} />
        <Route path="settings" element={<HousekeepingSettingsPage />} />
      </Route>

      <Route path="/Housekeeping/*" element={<Navigate to="/housekeeping" replace />} />
      <Route path="/Receptionist/*" element={<Navigate to="/receptionist" replace />} />

      {/* 6. Guest Routes (Dùng GuestLayout) */}
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
