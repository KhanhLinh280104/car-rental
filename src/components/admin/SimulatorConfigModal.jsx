import React, { useState, useEffect } from 'react';
import { X, Power, PowerOff, Plus, Minus, Settings, Cpu, Car, RefreshCw, Zap } from 'lucide-react';
import {
    getSimulatorConfigApi,
    enableSimulatorApi,
    disableSimulatorApi,
    setSimulatorVehiclesApi,
    addSimulatorVehicleApi,
    removeSimulatorVehicleApi
} from '../../api/simulatorApi';
import { getAllVehiclesApi } from '../../api/vehicleApi';

const SimulatorConfigModal = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch simulator config and vehicles list
    const fetchData = async () => {
        setLoading(true);
        try {
            const [configRes, vehiclesRes] = await Promise.all([
                getSimulatorConfigApi(),
                getAllVehiclesApi({ page: 0, size: 100 })
            ]);

            setConfig(configRes.data.data);
            setVehicles(vehiclesRes.data.data.content || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Toggle simulator on/off
    const handleToggleSimulator = async () => {
        setSaving(true);
        try {
            if (config.enabled) {
                await disableSimulatorApi();
            } else {
                await enableSimulatorApi();
            }
            await fetchData();
        } catch (error) {
            console.error('Error toggling simulator:', error);
        } finally {
            setSaving(false);
        }
    };

    // Toggle vehicle in simulation
    const handleToggleVehicle = async (vehicleId) => {
        setSaving(true);
        try {
            const isInSimulation = config.vehicleIds.includes(vehicleId);
            if (isInSimulation) {
                await removeSimulatorVehicleApi(vehicleId);
            } else {
                await addSimulatorVehicleApi(vehicleId);
            }
            await fetchData();
        } catch (error) {
            console.error('Error toggling vehicle:', error);
        } finally {
            setSaving(false);
        }
    };

    // Simulate all vehicles
    const handleSimulateAll = async () => {
        setSaving(true);
        try {
            await setSimulatorVehiclesApi([]);
            await fetchData();
        } catch (error) {
            console.error('Error setting all vehicles:', error);
        } finally {
            setSaving(false);
        }
    };

    // Clear all simulation
    const handleClearAll = async () => {
        setSaving(true);
        try {
            await setSimulatorVehiclesApi([]);
            // Then disable to stop simulation
            await disableSimulatorApi();
            await fetchData();
        } catch (error) {
            console.error('Error clearing simulation:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Only virtual vehicles can be simulated
    const virtualVehicles = vehicles.filter(v => v.isVirtual);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Cpu size={28} />
                        <div>
                            <h2 className="text-xl font-bold">Cấu Hình Simulator</h2>
                            <p className="text-sm text-white/80">Quản lý xe ảo đang được giả lập</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[calc(85vh-180px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <RefreshCw className="animate-spin text-blue-600" size={32} />
                            <span className="ml-3 text-gray-600">Đang tải...</span>
                        </div>
                    ) : config ? (
                        <>
                            {/* Simulator Status */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-full ${config.enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            {config.enabled ? (
                                                <Zap className="text-green-600" size={24} />
                                            ) : (
                                                <PowerOff className="text-gray-500" size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Trạng thái Simulator</h3>
                                            <p className={`text-sm ${config.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                                                {config.enabled ? '🟢 Đang chạy' : '⚪ Đã tắt'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleSimulator}
                                        disabled={saving}
                                        className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${config.enabled
                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                            } disabled:opacity-50`}
                                    >
                                        {config.enabled ? <PowerOff size={18} /> : <Power size={18} />}
                                        {config.enabled ? 'Tắt Simulator' : 'Bật Simulator'}
                                    </button>
                                </div>

                                {/* Config Details */}
                                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Update Interval</p>
                                        <p className="font-bold text-gray-800">{config.updateIntervalMs}ms</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Status Change</p>
                                        <p className="font-bold text-gray-800">{config.statusChangeIntervalMs}ms</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Số xe simulate</p>
                                        <p className="font-bold text-blue-600">
                                            {config.vehicleIds.length === 0 ? 'TẤT CẢ' : config.vehicleIds.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 mb-5">
                                <button
                                    onClick={handleSimulateAll}
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition disabled:opacity-50"
                                >
                                    Simulate TẤT CẢ xe ảo
                                </button>
                                <button
                                    onClick={fetchData}
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                                >
                                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            {/* Vehicle List */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Car size={20} />
                                    Danh sách xe ảo ({virtualVehicles.length} xe)
                                </h3>

                                {virtualVehicles.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Không có xe ảo nào trong hệ thống</p>
                                ) : (
                                    <div className="space-y-2">
                                        {virtualVehicles.map((vehicle) => {
                                            const isSimulating = config.vehicleIds.length === 0 || config.vehicleIds.includes(vehicle.id);

                                            return (
                                                <div
                                                    key={vehicle.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition ${isSimulating
                                                            ? 'bg-green-50 border-green-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSimulating ? 'bg-green-500' : 'bg-gray-300'
                                                            }`}>
                                                            <Car size={20} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {vehicle.model?.name || 'Unknown'}
                                                                <span className="text-gray-500 ml-2">#{vehicle.id}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {vehicle.plateNumber} • {vehicle.color}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isSimulating && config.enabled && (
                                                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
                                                                🔄 Đang simulate
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleVehicle(vehicle.id)}
                                                            disabled={saving || config.vehicleIds.length === 0}
                                                            className={`p-2 rounded-lg transition ${config.vehicleIds.length === 0
                                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                    : isSimulating
                                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                }`}
                                                            title={config.vehicleIds.length === 0 ? 'Đang simulate ALL' : (isSimulating ? 'Xóa khỏi simulation' : 'Thêm vào simulation')}
                                                        >
                                                            {isSimulating ? <Minus size={18} /> : <Plus size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Current whitelist */}
                            {config.vehicleIds.length > 0 && (
                                <div className="mt-5 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <strong>Whitelist hiện tại:</strong> Vehicle IDs: [{config.vehicleIds.join(', ')}]
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Không thể tải cấu hình simulator</p>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimulatorConfigModal;
