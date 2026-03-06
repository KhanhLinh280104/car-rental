import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import User from "./pages/User";
import Staff from "./pages/Staff";
import UserBookings from "./pages/user/UserBookings";
import UserCheckIn from "./pages/user/UserCheckIn";
import UserCheckOut from "./pages/user/UserCheckOut";
import UserPayment from "./pages/user/UserPayment";
import ChangePasswordContent from "./component/ChangePasswordContent";
import DeleteAccountContent from "./component/DeleteAccountContent";
import MainLayout from "./layouts/MainLayout";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";
// --- IMPORT CÁC TRANG STAFF ---
import Booking from "./component/staff/Booking";
import DriverList from "./component/staff/DriverList";
import VehicleList from "./component/staff/VehicleList";
import HandoverCar from "./component/staff/HandoverCar";
import ReturnCarAI from "./component/staff/ReturnCarAI";
import Payment from "./component/staff/Payment";

// --- IMPORT CÁC TRANG ADMIN ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFleet from "./pages/admin/AdminFleet";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminIncidents from "./pages/admin/AdminIncidents";

// --- IMPORT CÁC TRANG DRIVER---
import DriverTrip from "./pages/driver/DriverTrip";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverReport from "./pages/driver/DriverReport";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverHistory from "./pages/driver/DriverHistory";


function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [role, setRole] = useState("user");

  return (
    <Router>
      <Routes>
        {/* HOMEPAGE */}
        <Route path="/" element={<Home />} />

        {/* USER */}
        <Route
          path="/user"
          element={<MainLayout openLogin={() => setAuthModal("login")} role={role} setRole={setRole} sidebarType="user" />}

        >
          <Route index element={<User />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="checkin/:bookingId" element={<UserCheckIn />} />
          <Route path="checkout/:bookingId" element={<UserCheckOut />} />
          <Route path="payment/:bookingId" element={<UserPayment />} />
          <Route path="change-password" element={<ChangePasswordContent />} />
          <Route path="delete-account" element={<DeleteAccountContent />} />
        </Route>


        {/*STAFF*/}
        <Route
          path="/staff"
          element={<MainLayout openLogin={() => setAuthModal("login")} role={"staff"} setRole={setRole} sidebarType="staff" />}
        >
          <Route index element={<Staff />} />
          <Route path="change-password" element={<ChangePasswordContent />} />
          <Route path="delete-account" element={<DeleteAccountContent />} />
          <Route path="booking" element={<Booking />} />
          <Route path="driver-list" element={<DriverList/>}/>
          <Route path="vehicle-list" element={<VehicleList/>}/>
          <Route path="handover/:bookingId" element={<HandoverCar />} />
          <Route path="return-ai/:bookingId" element={<ReturnCarAI />} />
          <Route path="payment" element={<Payment />} />
          <Route path="payment/:bookingId" element={<Payment />} />
        </Route>


{/* --- DRIVER ROUTES --- */}
<Route
  path="/driver"
  element={
    <MainLayout
      openLogin={() => setAuthModal("login")}
      role="driver"
      setRole={setRole}
      sidebarType="driver"
    />
  }
>
  <Route index element={<DriverTrip />} />
  <Route path="dashboard" element={<DriverDashboard />} />
  <Route path="report" element={<DriverReport />} />
  <Route path="profile" element={<DriverProfile />} />
  <Route path="history" element={<DriverHistory />} />
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
