import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/user/layout/Sidebar";
import Navbar from "../components/user/layout/Navbar";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-40 w-72">
        <Sidebar />
      </div>

      <div className="ml-72 flex flex-1 flex-col">
        <header className="sticky top-0 z-40 h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <Navbar />
        </header>

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
