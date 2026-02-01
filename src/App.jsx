import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import User from "./pages/User";
import ChangePasswordContent from "./component/ChangePasswordContent";
import DeleteAccountContent from "./component/DeleteAccountContent";
import MainLayout from "./layouts/MainLayout";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";

// --- IMPORT CÁC TRANG ADMIN ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFleet from "./pages/admin/AdminFleet";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminIncidents from "./pages/admin/AdminIncidents";

function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [role, setRole] = useState("guest");

  return (
    <Router>
      <Routes>
        {/* Homepage - standalone with Header, no Sidebar */}
        <Route path="/" element={<Home />} />

        {/* App routes - with MainLayout (Header + Sidebar + Footer) */}
        <Route
          path="/user"
          element={<MainLayout openLogin={() => setAuthModal("login")} role={role} setRole={setRole} sidebarType="user" />}
        >
          <Route index element={<User />} />
          <Route path="change-password" element={<ChangePasswordContent />} />
          <Route path="delete-account" element={<DeleteAccountContent />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route 
          path="/admin" 
          element={
            <MainLayout 
              role="admin" 
              setRole={setRole} 
              sidebarType="role" 
              openLogin={() => setAuthModal("login")} 
            />
          }
        >
          {/* 1. Dashboard tổng quan */}
          <Route index element={<AdminDashboard />} />
          {/* 2. Quản lý đội xe & IoT */}
          <Route path="fleet" element={<AdminFleet />} />
          {/* 3. Quản lý đặt xe */}
          <Route path="bookings" element={<AdminBookings />} />
          {/* 4. Quản lý người dùng */}
          <Route path="users" element={<AdminUsers />} />
          {/* 5. Cấu hình hệ thống */}
          <Route path="settings" element={<AdminSettings />} />
          {/* 6. Quản lý tài xế */}
          <Route path="drivers" element={<AdminDrivers />} />
          {/* 7. GPS */}
          <Route path="tracking" element={<AdminTracking />} />
          {/* 8. báo cáo hư hại */}
          <Route path="incidents" element={<AdminIncidents />} />
        </Route>

      </Routes>

      {authModal === "login" && (
        <LoginModal
          close={() => setAuthModal(null)}
          goRegister={() => setAuthModal("register")}
        />
      )}

      {authModal === "register" && (
        <RegisterModal
          close={() => setAuthModal(null)}
          goLogin={() => setAuthModal("login")}
        />
      )}

    </Router>
  );
}

export default App;
