import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from '../components/layout/PageTransition';

const MainLayout = () => {
  const location = useLocation();
  const isTransparentNav = location.pathname === "/" || location.pathname === "/hotels" || location.pathname === "/offers" || location.pathname === "/articles" || location.pathname === "/support/help-center";

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
      <Footer />
    </div>
  );
};

export default MainLayout;
