 import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
 const Footer = () => {
return(
 <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Car Rental</h3>
            <p className="text-sm mb-4">
              Dịch vụ cho thuê xe tự lái uy tín, chất lượng hàng đầu Việt Nam
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-600 transition">Cho thuê xe tự lái</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Cho thuê xe có tài xế</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Cho thuê xe du lịch</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Cho thuê xe dài hạn</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-600 transition">Chính sách thuê xe</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Giải quyết khiếu nại</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span>1900 9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span>contact@homezgo.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2024 HOMEZGO. All rights reserved.</p>
        </div>
      </div>
    </footer>
);
 };
 export default Footer;