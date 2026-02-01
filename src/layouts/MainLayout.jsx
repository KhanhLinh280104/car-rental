import { Outlet } from "react-router-dom";
import MainHeader from "../component/MainHeader";
import Sidebar from "../component/Sidebar";
import UserSidebar from "../component/UserSidebar";
import Footer from "../component/Footer";

export default function MainLayout({ openLogin, role = "guest", setRole, sidebarType = "role" }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8 w-full">
        <div className="md:flex md:space-x-6">
          {sidebarType === "user" ? (
            <UserSidebar active="account" />
          ) : (
            <Sidebar role={role} />
          )}

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
