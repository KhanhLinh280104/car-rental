import { useState } from "react";
import { MapPin, BatteryCharging } from "lucide-react";

const vehicles = [
  { id: 1, name: "Toyota Camry", plate: "ABC-123", battery: 85, location: "Quận 1" },
  { id: 2, name: "VinFast VF8", plate: "VF-888", battery: 42, location: "Quận 7" },
  { id: 3, name: "Honda Civic", plate: "XYZ-789", battery: 18, location: "Sân bay" },
  { id: 4, name: "Kia Morning", plate: "KM-456", battery: 67, location: "Quận 1" },
];

export default function VehicleList() {
  const [batteryFilter, setBatteryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const batteryColor = (level) => {
    if (level > 60) return "bg-green-500";
    if (level > 30) return "bg-yellow-400";
    return "bg-red-500";
  };

  const locations = [...new Set(vehicles.map((v) => v.location))];

  const filteredVehicles = vehicles.filter((car) => {
    const matchBattery =
      batteryFilter === "all" ||
      (batteryFilter === "high" && car.battery > 60) ||
      (batteryFilter === "medium" && car.battery > 30 && car.battery <= 60) ||
      (batteryFilter === "low" && car.battery <= 30);

    const matchLocation =
      locationFilter === "all" || car.location === locationFilter;

    return matchBattery && matchLocation;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Danh sách xe</h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border shadow-sm">
        {/* Battery filter */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Mức pin</p>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={batteryFilter}
            onChange={(e) => setBatteryFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="high">Pin cao (&gt;60%)</option>
            <option value="medium">Pin trung bình (30–60%)</option>
            <option value="low">Pin thấp (&le;30%)</option>
          </select>
        </div>

        {/* Location filter */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Địa điểm</p>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VEHICLE LIST */}
      {filteredVehicles.map((car) => (
        <div
          key={car.id}
          className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
        >
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">{car.name}</h2>
              <p className="text-gray-500">{car.plate}</p>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <BatteryCharging size={18} />
              {car.battery}%
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${batteryColor(car.battery)}`}
                  style={{ width: `${car.battery}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} />
              {car.location}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
