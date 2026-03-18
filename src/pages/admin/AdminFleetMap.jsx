import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Battery, Zap, MapPin, RefreshCw, Navigation, Car } from 'lucide-react';
import { getAllVehiclesApi } from '../../api/vehicleApi';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on vehicle status
const createVehicleIcon = (status, batteryLevel) => {
    const colors = {
        AVAILABLE: '#22c55e',     // green
        IN_USE: '#3b82f6',        // blue
        MAINTENANCE: '#ef4444',   // red
        CHARGING: '#eab308',      // yellow
    };

    const color = colors[status] || '#6b7280';
    const batteryColor = batteryLevel < 20 ? '#ef4444' : (batteryLevel < 50 ? '#eab308' : '#22c55e');

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
      <div style="
        position: relative;
        width: 40px;
        height: 50px;
      ">
        <div style="
          width: 40px;
          height: 40px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
          ">🚗</span>
        </div>
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: ${batteryColor};
          border: 2px solid white;
          border-radius: 8px;
          padding: 2px 4px;
          font-size: 10px;
          font-weight: bold;
          color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">${batteryLevel || 0}%</div>
      </div>
    `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
    });
};

// Component to fit map bounds to all vehicles
const FitBounds = ({ vehicles }) => {
    const map = useMap();

    useEffect(() => {
        if (vehicles.length > 0) {
            const bounds = vehicles
                .filter(v => v.currentState?.latitude && v.currentState?.longitude)
                .map(v => [v.currentState.latitude, v.currentState.longitude]);

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        }
    }, [vehicles, map]);

    return null;
};

// Reverse geocoding using Nominatim (OpenStreetMap)
const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
        );
        const data = await response.json();
        return data.display_name || 'Không xác định';
    } catch (error) {
        console.error('Geocoding error:', error);
        return 'Không thể xác định địa chỉ';
    }
};

const AdminFleetMap = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [addresses, setAddresses] = useState({});
    const [filter, setFilter] = useState('ALL');
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Ho Chi Minh City center as default
    const defaultCenter = [10.8231, 106.6297];
    const defaultZoom = 12;

    // Fetch vehicles
    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllVehiclesApi({ page: 0, size: 100 });
            const vehicleData = response.data.data.content || [];
            setVehicles(vehicleData);

            // Fetch addresses for vehicles with GPS data
            vehicleData.forEach(async (vehicle) => {
                if (vehicle.currentState?.latitude && vehicle.currentState?.longitude) {
                    const address = await reverseGeocode(
                        vehicle.currentState.latitude,
                        vehicle.currentState.longitude
                    );
                    setAddresses(prev => ({ ...prev, [vehicle.id]: address }));
                }
            });
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchVehicles, 10000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, fetchVehicles]);

    // Filter vehicles
    const filteredVehicles = vehicles.filter(v => {
        if (filter === 'ALL') return true;
        if (filter === 'WITH_GPS') return v.currentState?.latitude && v.currentState?.longitude;
        return v.status === filter;
    });

    const getStatusLabel = (status) => {
        const labels = {
            AVAILABLE: 'Sẵn sàng',
            IN_USE: 'Đang dùng',
            MAINTENANCE: 'Bảo trì',
            CHARGING: 'Đang sạc',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            AVAILABLE: 'bg-green-500',
            IN_USE: 'bg-blue-500',
            MAINTENANCE: 'bg-red-500',
            CHARGING: 'bg-yellow-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header Controls */}
            <div className="bg-white p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Navigation className="text-blue-600" size={24} />
                        GPS Tracking - Theo dõi vị trí xe
                    </h2>
                    <span className="text-sm text-gray-500">
                        {filteredVehicles.filter(v => v.currentState?.latitude).length}/{vehicles.length} xe có GPS
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter dropdown */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Tất cả xe</option>
                        <option value="WITH_GPS">Chỉ xe có GPS</option>
                        <option value="AVAILABLE">🟢 Sẵn sàng</option>
                        <option value="IN_USE">🔵 Đang dùng</option>
                        <option value="CHARGING">🟡 Đang sạc</option>
                        <option value="MAINTENANCE">🔴 Bảo trì</option>
                    </select>

                    {/* Auto-refresh toggle */}
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${autoRefresh
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                        {autoRefresh ? 'Đang tự động cập nhật' : 'Tự động cập nhật'}
                    </button>

                    {/* Manual refresh */}
                    <button
                        onClick={fetchVehicles}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    className="h-full w-full z-0"
                    style={{ minHeight: '500px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitBounds vehicles={filteredVehicles} />

                    {filteredVehicles.map((vehicle) => {
                        if (!vehicle.currentState?.latitude || !vehicle.currentState?.longitude) {
                            return null;
                        }

                        return (
                            <Marker
                                key={vehicle.id}
                                position={[vehicle.currentState.latitude, vehicle.currentState.longitude]}
                                icon={createVehicleIcon(vehicle.status, vehicle.currentState.batteryLevel)}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(vehicle),
                                }}
                            >
                                <Popup minWidth={280} maxWidth={350}>
                                    <div className="p-2">
                                        {/* Header */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <Car className="text-blue-600" size={20} />
                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    {vehicle.model?.name || 'Unknown Model'}
                                                </h3>
                                                <p className="text-sm text-gray-500">{vehicle.plateNumber}</p>
                                            </div>
                                            <span className={`ml-auto px-2 py-1 text-xs font-bold text-white rounded ${getStatusColor(vehicle.status)}`}>
                                                {getStatusLabel(vehicle.status)}
                                            </span>
                                        </div>

                                        {/* Battery & Speed */}
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Battery
                                                    size={16}
                                                    className={vehicle.currentState.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}
                                                />
                                                <span className="font-medium">{vehicle.currentState.batteryLevel}%</span>
                                                {vehicle.currentState.isCharging && (
                                                    <Zap size={14} className="text-yellow-500 animate-pulse" />
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                🚀 {vehicle.currentState.speedKmh?.toFixed(1) || 0} km/h
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                📏 {vehicle.odometerKm?.toFixed(0) || 0} km
                                            </div>
                                        </div>

                                        {/* GPS Coordinates */}
                                        <div className="bg-gray-50 rounded-lg p-2 mb-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="text-red-500 mt-0.5" />
                                                <div className="text-xs">
                                                    <div className="font-mono text-gray-700">
                                                        {vehicle.currentState.latitude.toFixed(6)}, {vehicle.currentState.longitude.toFixed(6)}
                                                    </div>
                                                    <div className="text-gray-500 mt-1">
                                                        {addresses[vehicle.id] || 'Đang tải địa chỉ...'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Last Update */}
                                        <div className="text-xs text-gray-400 text-right">
                                            Cập nhật: {vehicle.currentState.lastUpdatedAt
                                                ? new Date(vehicle.currentState.lastUpdatedAt).toLocaleString('vi-VN')
                                                : 'N/A'
                                            }
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Chú thích</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span>Sẵn sàng ({vehicles.filter(v => v.status === 'AVAILABLE').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>Đang dùng ({vehicles.filter(v => v.status === 'IN_USE').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span>Đang sạc ({vehicles.filter(v => v.status === 'CHARGING').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span>Bảo trì ({vehicles.filter(v => v.status === 'MAINTENANCE').length})</span>
                        </div>
                    </div>
                </div>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[1000]">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
                            <RefreshCw className="animate-spin text-blue-600" size={20} />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehicle List Sidebar (Optional - shows when no vehicle selected) */}
            <div className="bg-white border-t border-gray-200 p-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filteredVehicles.slice(0, 10).map((vehicle) => (
                        <div
                            key={vehicle.id}
                            onClick={() => setSelectedVehicle(vehicle)}
                            className={`flex-shrink-0 p-2 rounded-lg border cursor-pointer transition hover:shadow-md ${selectedVehicle?.id === vehicle.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(vehicle.status)}`}></span>
                                <span className="font-medium text-sm">{vehicle.plateNumber}</span>
                                {vehicle.currentState?.batteryLevel && (
                                    <span className="text-xs text-gray-500">{vehicle.currentState.batteryLevel}%</span>
                                )}
                                {!vehicle.currentState?.latitude && (
                                    <span className="text-xs text-red-500">No GPS</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminFleetMap;
