import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/layout/PageTransition';
import PendingReviewsModal from '../components/layout/PendingReviewsModal';

const MainLayout = () => {
  const location = useLocation();
  const isTransparentNav = location.pathname === "/" || location.pathname === "/hotels" || location.pathname === "/offers" || location.pathname === "/articles" || location.pathname === "/support/help-center" || location.pathname === "/bookings" || location.pathname === "/booking";

  return (
    <div className="main-layout-container flex flex-col min-h-screen">
      <Navbar />
      <main className={`grow ${isTransparentNav ? "" : "pt-16"}`}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <PendingReviewsModal />
      <Footer />
    </div>
  );
};

export default MainLayout;
