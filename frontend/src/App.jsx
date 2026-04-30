import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ThemeInitializer() {
  useEffect(() => {
    const theme = localStorage.getItem("app-theme");
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeInitializer />
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
