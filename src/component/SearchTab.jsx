import { useState } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState("self");

  const tabStyle = (tab) =>
    `px-6 py-2 rounded-full font-semibold transition ${
      activeTab === tab
        ? "bg-green-600 text-white shadow"
        : "text-gray-500 hover:text-green-600"
    }`;

  return (
    <div className="bg-white rounded-4xl shadow-2xl p-10 w-full max-w-5xl mx-auto">

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("self")} className={tabStyle("self")}>
          Xe tự lái
        </button>
        <button onClick={() => setActiveTab("driver")} className={tabStyle("driver")}>
          Xe có tài
        </button>
        <button onClick={() => setActiveTab("long")} className={tabStyle("long")}>
          Thuê dài hạn
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "self" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" placeholder="Địa điểm nhận xe" className="outline-none w-full" />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <input type="date" className="outline-none" />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <Clock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="time" className="outline-none" />
          </div>

          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
            Tìm xe
          </button>
        </div>
      )}

      {activeTab === "driver" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" defaultValue="TP. Hồ Chí Minh" className="outline-none w-full" />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2 flex-1">
            <Clock className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">21:00, 19/01 - 20:00, 20/01</span>
          </div>

          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
            Tìm xe
          </button>
        </div>
      )}

      {activeTab === "long" && (
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" placeholder="Thành phố thuê xe dài hạn" className="outline-none w-full" />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <input type="month" className="outline-none" />
          </div>

          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
            Tìm xe
          </button>
        </div>
      )}
    </div>
  );
}
