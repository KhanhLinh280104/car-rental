
import Footer from "../component/Footer";
import Hero from "../component/Hero";
import CarBrand from "../component/CarBrand";
import WhyChooseUs from "../component/WhyChooseUs";
import RentalProcess from "../component/RentalProcess";
import SearchTab from "../component/SearchTab";


import "./home.css";

const Home = () => {
  return (
    <div className="home">
      
      <Hero />
      <SearchTab/>
      <CarBrand />
      <WhyChooseUs />
      <RentalProcess />
      <Footer />

    </div>
  );
};

export default Home;
