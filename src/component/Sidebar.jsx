import { Link } from "react-router-dom";

export default function Sidebar({ role = "guest" }) {
  const menus = {
    guest: [
      { to: "/", label: "Trang chủ" },
      { to: "/user", label: "Thông tin" },
    ],
    user: [
      { to: "/", label: "Trang chủ" },
      { to: "/bookings", label: "Đơn đặt" },
      { to: "/user", label: "Hồ sơ" },
    ],
    admin: [
      { to: "/", label: "Trang chủ" },
      { to: "/admin", label: "Quản trị" },
      { to: "/manage/users", label: "Người dùng" },
      { to: "/user", label: "Hồ sơ" },
    ],
  };

  const items = menus[role] || menus.guest;

  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <div className="p-4">
        <h4 className="font-semibold mb-4">Menu</h4>
        <nav className="flex flex-col space-y-2">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="text-gray-700 hover:text-green-600">
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
