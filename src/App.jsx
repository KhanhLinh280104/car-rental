import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import User from "./pages/User";
import ChangePasswordContent from "./component/ChangePasswordContent";
import DeleteAccountContent from "./component/DeleteAccountContent";
import MainLayout from "./layouts/MainLayout";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";

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
