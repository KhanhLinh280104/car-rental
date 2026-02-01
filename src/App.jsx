import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import User from "./pages/User";
import Staff from "./pages/Staff";
import ChangePasswordContent from "./component/ChangePasswordContent";
import DeleteAccountContent from "./component/DeleteAccountContent";
import MainLayout from "./layouts/MainLayout";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";
import Booking from "./component/staff/Booking";
import DriverList from "./component/staff/DriverList";
import VehicleList from "./component/staff/VehicleList";

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
