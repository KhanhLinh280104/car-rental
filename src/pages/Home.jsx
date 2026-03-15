import { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import Hero from "../component/Hero";
import CarBrand from "../component/CarBrand";
import WhyChooseUs from "../component/WhyChooseUs";
import RentalProcess from "../component/RentalProcess";
import VehicleSection from "../component/VehicleSection";
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
        <CarBrand />

        {/* Danh sách xe thực từ database — khách hàng chọn và đặt ngay */}
        <VehicleSection openLogin={() => setAuthModal("login")} />

        <WhyChooseUs />
        <RentalProcess />
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
