import { Outlet } from "react-router-dom";
// Kiểm tra kỹ: Nếu nhóm trưởng dùng file MainHeader.jsx thì sửa dòng dưới thành "../component/MainHeader"
import Header from "../component/Header";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";

export default function MainLayout({ openLogin, role = "user", setRole, sidebarType = "role" }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* SỬA QUAN TRỌNG: Phải truyền openLogin vào đây thì nút Đăng nhập mới chạy */}
      <Header openLogin={openLogin} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8 w-full">
        <div className="md:flex md:space-x-6">
          {/* Sidebar giữ nguyên code của bạn */}
          <Sidebar role={role} sidebarType={sidebarType} />

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}