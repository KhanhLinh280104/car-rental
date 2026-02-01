import { Link } from "react-router-dom";

export default function User() {
  return (
    <section className="user-page" style={{ padding: 24 }}>
      <h1>Trang Người Dùng</h1>
      <p>Đây là trang profile mẫu dựa trên MainLayout. Nội dung không bị chồng hay đè bởi Header/Footers.</p>

      <div style={{ marginTop: 16 }}>
        <strong>Thông tin mẫu:</strong>
        <ul>
          <li>Tên: Nguyễn Văn A</li>
          <li>Email: example@example.com</li>
        </ul>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/">Quay về trang chủ</Link>
      </div>
    </section>
  );
}
