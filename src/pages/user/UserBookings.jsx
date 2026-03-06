import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, UserRound, Calendar, MapPin, Wallet } from "lucide-react";
import { formatMoneyVND, mockUserBookings } from "./mockUserBookings";

const statusBadge = {
  confirmed: { label: "Chờ nhận xe", cls: "bg-blue-100 text-blue-700" },
  checked_in: { label: "Đang sử dụng", cls: "bg-green-100 text-green-700" },
  returned: { label: "Đã trả xe", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Đã thanh toán", cls: "bg-gray-100 text-gray-700" },
};

export default function UserBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all"); // all | self | driver
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return mockUserBookings.filter((b) => {
      const matchTab =
        tab === "all" ||
        (tab === "self" && !b.driver) ||
        (tab === "driver" && Boolean(b.driver));
      const text = `${b.id} ${b.vehicle.name} ${b.vehicle.plate} ${b.pickup.location} ${b.dropoff.location}`.toLowerCase();
      const matchQ = !query || text.includes(query);
      return matchTab && matchQ;
    });
  }, [tab, q]);

  const goPrimaryAction = (b) => {
    if (b.status === "confirmed") navigate(`/user/checkin/${b.id}`);
    else if (b.status === "checked_in") navigate(`/user/checkout/${b.id}`);
    else if (b.status === "returned") navigate(`/user/payment/${b.id}`);
  };

  const primaryLabel = (status) => {
    if (status === "confirmed") return "Check-in (Nhận xe)";
    if (status === "checked_in") return "Check-out (Trả xe)";
    if (status === "returned") return "Thanh toán";
    return "Xem chi tiết";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn thuê của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý check-in / check-out và thanh toán cho đơn tự lái hoặc có tài xế.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          {[
            { key: "all", label: "Tất cả" },
            { key: "self", label: "Tự lái" },
            { key: "driver", label: "Có tài xế" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                tab === t.key ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-[420px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã đơn, xe, biển số, địa điểm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((b) => {
          const badge = statusBadge[b.status] || statusBadge.confirmed;
          const isDriver = Boolean(b.driver);
          return (
            <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Car size={18} className="text-gray-700" /> {b.vehicle.name}
                    <span className="text-sm text-gray-400 font-medium">({b.vehicle.plate})</span>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className={`px-3 py-1 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>
                    {isDriver ? (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold inline-flex items-center gap-1">
                        <UserRound size={16} /> Có tài xế
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                        Tự lái
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="text-lg font-extrabold text-green-600">{formatMoneyVND(b.total)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-sm">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <Calendar size={16} /> Thời gian
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{b.pickup.time}</p>
                  <p className="text-gray-600 mt-1">→ {b.dropoff.time}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <MapPin size={16} /> Nhận / Trả
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{b.pickup.location}</p>
                  <p className="text-gray-600 mt-1">→ {b.dropoff.location}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-gray-500 flex items-center gap-2">
                    <Wallet size={16} /> Cọc
                  </p>
                  <p className="font-semibold text-gray-800 mt-1">{formatMoneyVND(b.deposit)}</p>
                  {isDriver && (
                    <p className="text-gray-500 mt-1">
                      Tài xế: <span className="font-semibold text-gray-800">{b.driver.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => navigate(`/user/payment/${b.id}`)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-700 font-semibold"
                >
                  Xem hoá đơn
                </button>
                {b.status !== "paid" && (
                  <button
                    onClick={() => goPrimaryAction(b)}
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white transition font-semibold"
                  >
                    {primaryLabel(b.status)}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            Không có đơn phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}

