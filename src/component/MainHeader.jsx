import { Phone, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const MainHeader = () => {

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">

          {/* LOGO */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-800"
            >
              Car Rental
            </Link>
          </div>

         

          

          <button className="md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

        </div>
      </div>
    </header>
  );
};

export default MainHeader;
