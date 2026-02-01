import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Hero from "../component/Hero";
import CarBrand from "../component/CarBrand";
import WhyChooseUs from "../component/WhyChooseUs";
import RentalProcess from "../component/RentalProcess";
import SearchTab from "../component/SearchTab";
import LoginModal from "../component/LoginModal";
import RegisterModal from "../component/RegisterModal";

import "./home.css";

const Home = () => {
  const [authModal, setAuthModal] = useState(null);

  return (
    <>
      <Header openLogin={() => setAuthModal("login")} />
      
      <div className="home">
        <Hero />
        <SearchTab />
        <CarBrand />
        <WhyChooseUs />
        <RentalProcess />
        
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Link to="/user" className="text-green-600 hover:text-green-800 font-semibold">Đi tới trang User</Link>
        </div>
      </div>

      <Footer />

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
    </>
  );
};

export default Home;
