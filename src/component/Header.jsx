import { Phone, User, Menu } from "lucide-react";

const Header = ({openLogin}) => {

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
            <div
              onClick={scrollToTop}
              className="text-2xl font-bold text-green-600 cursor-pointer"
            >
              Car Rental
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-600 transition">Trang chủ</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition">Xe cho thuê</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition">Dịch vụ</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition">Tin tức</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition">Liên hệ</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Phone className="w-5 h-5" />
              <span className="font-semibold">1900 9999</span>
            </div>

            <button onClick={openLogin}
            className="flex items-center space-x-2 px-4 py-2 text-black rounded-lg hover:bg-green-600 transition">
              <User className="w-5 h-5" />
              <span>Đăng nhập</span>
            </button>
          </div>

          <button className="md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
  