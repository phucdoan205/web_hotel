import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";

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

      {/* 3. 404 Route */}
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
