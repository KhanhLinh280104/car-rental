import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Header from "./component/Header";
import LoginModal from "./component/LoginModal";
import RegisterModal from "./component/RegisterModal";

function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null

  return (
    <Router>
      <Header openLogin={() => setAuthModal("login")} />

      <Routes>
        <Route path="/" element={<Home />} />
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
