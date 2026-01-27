import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Header from "./component/Header";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";
import UserProfile from './pages/UserProfile';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DeleteAccountPage from './pages/DeleteAccountPage';

function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null

  return (
    <Router>
      <Header openLogin={() => setAuthModal("login")} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<UserProfile />} />

        <Route path="/user/change-password" element={<ChangePasswordPage />} />
        <Route path="/user/delete-account" element={<DeleteAccountPage />} />
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
