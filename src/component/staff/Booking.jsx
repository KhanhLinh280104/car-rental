import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  AlertTriangle,
  Upload,
  X,
} from "lucide-react";

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [checkinFilter, setCheckinFilter] = useState("all");
  const [damageModal, setDamageModal] = useState(null);
  const [damageNote, setDamageNote] = useState("");
  const [damageImages, setDamageImages] = useState([]);

  useEffect(() => {
    setBookings([
      {
        id: "1",
        vehicle: { name: "Toyota Camry", plate: "ABC-123" },
        customer: { name: "Nguyễn Văn A", phone: "0912345678" },
        driver: null,
        start: "2024-02-01",
        end: "2024-02-05",
        total: 3500000,
        status: "confirmed",
      },
      {
        id: "2",
        vehicle: { name: "Honda Civic", plate: "XYZ-789" },
        customer: { name: "Trần Thị B", phone: "0987654321" },
        driver: { name: "Tài xế Minh", phone: "0909999999" },
        start: "2024-01-28",
        end: "2024-02-02",
        total: 2800000,
        status: "checked_in",
      },
    ]);
  }, []);

  const filtered = bookings.filter((b) => {
    const text = `${b.vehicle.name} ${b.customer.name} ${b.driver?.name || ""}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchTab =
      tab === "all" ||
      (tab === "self" && !b.driver) ||
      (tab === "driver" && b.driver);

    // checkinFilter: 'all' | 'checked_in' | 'not_checked_in'
    const matchCheckin =
      checkinFilter === "all" ||
      (checkinFilter === "checked_in" && b.status === "checked_in") ||
      (checkinFilter === "not_checked_in" && b.status !== "checked_in");

    return matchSearch && matchTab && matchCheckin;
  });

  const checkIn = (id) =>
    setBookings((b) =>
      b.map((x) => (x.id === id ? { ...x, status: "checked_in" } : x))
    );

  const checkOut = (id) => {
    setBookings((b) =>
      b.map((x) => (x.id === id ? { ...x, status: "completed" } : x))
    );
    setDamageModal(null);
    setDamageImages([]);
    setDamageNote("");
  };

  const statusColor = {
    confirmed: "bg-blue-100 text-blue-600",
    checked_in: "bg-green-100 text-green-600",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Đơn đặt xe</h1>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          placeholder="Tìm xe, khách, tài xế..."
          className="pl-10 pr-4 py-2 border rounded-xl w-full"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "self", label: "Tự lái" },
          { key: "driver", label: "Có tài xế" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm ${
              tab === t.key ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CHECK-IN FILTER */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Lọc Check-in:</span>
        {[
          { key: "all", label: "Tất cả" },
          { key: "not_checked_in", label: "Chưa nhận" },
          { key: "checked_in", label: "Đã nhận" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setCheckinFilter(f.key)}
            className={`px-3 py-1 rounded-full text-sm ${
              checkinFilter === f.key ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{b.vehicle.name}</h3>
                <p className="text-sm text-gray-400 flex gap-2 items-center">
                  {b.vehicle.plate}
                  {b.driver ? (
                    <span className="bg-purple-100 text-purple-600 px-2 rounded-full text-xs">
                      Có tài xế
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-600 px-2 rounded-full text-xs">
                      Tự lái
                    </span>
                  )}
                </p>
              </div>
              <span
                className={`px-4 py-3 rounded-full text-sm font-medium ${statusColor[b.status]}`}
              >
                {b.status === "confirmed"
                  ? "Đã xác nhận"
                  : b.status === "checked_in"
                  ? "Đang thuê"
                  : "Hoàn thành"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Khách hàng</p>
                <p>{b.customer.name}</p>
                <p className="text-gray-400">{b.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Tài xế</p>
                <p>{b.driver?.name || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Thời gian thuê</p>
                <p>
                  {b.start} → {b.end}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tổng tiền</p>
                <p className="text-green-600 font-semibold">
                  {b.total.toLocaleString()} ₫
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              {b.status === "confirmed" && (
                <button
                  onClick={() => checkIn(b.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Check-in
                </button>
              )}
              {b.status === "checked_in" && (
                <button
                  onClick={() => setDamageModal(b)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Check-out
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DAMAGE MODAL */}
      {damageModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDamageModal(null)}
        >
          <div
            className="bg-white w-[440px] rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Ghi nhận hư hại
              </h3>
              <X onClick={() => setDamageModal(null)} />
            </div>

            <textarea
              placeholder="Mô tả hư hại..."
              className="w-full border rounded-xl p-3"
              onChange={(e) => setDamageNote(e.target.value)}
            />

            <label className="flex flex-col items-center border-2 border-dashed rounded-xl p-6 cursor-pointer">
              <Upload size={22} />
              Upload hình ảnh
              <input
                type="file"
                multiple
                hidden
                onChange={(e) =>
                  setDamageImages((p) => [...p, ...Array.from(e.target.files)])
                }
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {damageImages.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  className="h-20 w-full object-cover rounded-lg"
                />
              ))}
            </div>

            <button
              onClick={() => checkOut(damageModal.id)}
              className="w-full bg-red-600 text-white py-2 rounded-xl"
            >
              Xác nhận Check-out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
