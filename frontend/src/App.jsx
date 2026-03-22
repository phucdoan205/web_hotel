import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      {/* Sau này bạn có thể bọc AuthProvider hoặc Redux Provider ở đây */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
