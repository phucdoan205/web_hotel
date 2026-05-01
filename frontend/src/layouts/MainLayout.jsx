import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/hotels";

  return (
    <div className="main-layout-container flex flex-col min-h-screen">
      <Navbar />
      <main className={`grow ${isHomePage ? "" : "pt-16"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;