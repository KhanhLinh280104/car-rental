import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, Car, Users, Activity, TrendingUp, ArrowDownRight, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  getDashboardOverviewApi,
  getDashboardChartApi,
  getDashboardRecentApi,
  getFleetStatsApi,
  getUserStatsApi,
} from '../../api/dashboardApi';

const FLEET_COLORS = {
  available:   { color: '#10B981', label: 'Sẵn sàng' },
  inUse:       { color: '#3B82F6', label: 'Đang thuê' },
  maintenance: { color: '#EF4444', label: 'Bảo trì' },
  charging:    { color: '#F59E0B', label: 'Đang sạc' },
  damaged:     { color: '#6B7280', label: 'Hỏng hóc' },
};

const STATUS_LABELS = {
  PENDING:     { label: 'Chờ duyệt',  cls: 'bg-yellow-50 text-yellow-700' },
  CONFIRMED:   { label: 'Đã duyệt',   cls: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: 'Đang thuê',  cls: 'bg-purple-50 text-purple-700' },
  COMPLETED:   { label: 'Hoàn thành', cls: 'bg-green-50 text-green-700' },
  CANCELLED:   { label: 'Đã hủy',     cls: 'bg-red-50 text-red-600' },
  OVERDUE:     { label: 'Quá hạn',    cls: 'bg-orange-50 text-orange-700' },
};

const formatRevenue = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000)     return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)         return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const formatChangePercent = (pct) => {
  if (pct == null || isNaN(pct)) return null;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview]         = useState(null);
  const [chartData, setChartData]       = useState([]);
  const [fleetStats, setFleetStats]     = useState(null);
  const [userStats, setUserStats]       = useState(null);
  const [recentList, setRecentList]     = useState([]);

  const days = period === '30d' ? 30 : period === 'all' ? 0 : 7;

  const loadAll = useCallback(async (p) => {
    setLoading(true);
    try {
      const [overviewRes, chartRes, recentRes, fleetRes, userRes] = await Promise.allSettled([
        getDashboardOverviewApi(p),
        getDashboardChartApi(p),
        getDashboardRecentApi(),
        getFleetStatsApi(),
        getUserStatsApi(p === '30d' ? 30 : p === 'all' ? 36500 : 7),
      ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data?.data);
      if (chartRes.status    === 'fulfilled') setChartData(chartRes.value.data?.data ?? []);
      if (recentRes.status   === 'fulfilled') setRecentList(recentRes.value.data?.data ?? []);
      if (fleetRes.status    === 'fulfilled') setFleetStats(fleetRes.value.data?.data);
      if (userRes.status     === 'fulfilled') setUserStats(userRes.value.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll(period);
  }, [period, loadAll]);

  const handleDateFilter = async () => {
    const { value: selected } = await Swal.fire({
      title: 'Chọn khoảng thời gian',
      input: 'radio',
      inputOptions: {
        '7d':  '7 ngày qua',
        '30d': '30 ngày qua (Tháng này)',
        'all': 'Tất cả thời gian',
      },
      inputValue: period,
      showCancelButton: true,
      confirmButtonText: 'Áp dụng',
      cancelButtonText: 'Hủy',
    });
    if (selected && selected !== period) {
      setPeriod(selected);
    }
  };

  const handleViewDetails = () => {
    const rows = chartData.map(item => `
      <tr class="border-b">
        <td class="p-2 text-left">${item.name}</td>
        <td class="p-2 text-right font-bold text-blue-600">${Number(item.revenue).toLocaleString('vi-VN')} đ</td>
        <td class="p-2 text-right">${item.bookings} chuyến</td>
      </tr>
    `).join('');

    Swal.fire({
      title: `Chi tiết doanh thu (${period === '30d' ? '30 ngày qua' : '7 ngày qua'})`,
      html: `
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Thời gian</th>
                <th class="p-2 text-right">Doanh thu</th>
                <th class="p-2 text-right">Đơn hàng</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`,
      width: '600px',
      confirmButtonText: 'Đóng lại',
    });
  };

  // ── Stat cards data ──────────────────────────────────────────────
  const revenueChange = formatChangePercent(overview?.revenueChangePercent);
  const tripsChange   = formatChangePercent(overview?.tripsChangePercent);

  const STATS = [
    {
      id: 1,
      title: 'Tổng doanh thu',
      value: overview ? formatRevenue(Number(overview.totalRevenue)) : '—',
      change: revenueChange ?? '—',
      isPositive: (overview?.revenueChangePercent ?? 0) >= 0,
      icon: DollarSign,
      colorClass: 'bg-green-100 text-green-600',
    },
    {
      id: 2,
      title: 'Tổng chuyến xe',
      value: overview ? String(overview.totalTrips) : '—',
      change: tripsChange ?? '—',
      isPositive: (overview?.tripsChangePercent ?? 0) >= 0,
      icon: Car,
      colorClass: 'bg-blue-100 text-blue-600',
    },
    {
      id: 3,
      title: period === 'all' ? 'Tổng khách hàng' : 'Khách hàng mới',
      value: userStats ? String(period === 'all' ? userStats.totalCustomers : userStats.newCustomers) : '—',
      change: period === 'all' ? 'Toàn bộ' : `${days} ngày qua`,
      isPositive: true,
      icon: Users,
      colorClass: 'bg-purple-100 text-purple-600',
    },
    {
      id: 4,
      title: 'Cảnh báo IoT',
      value: fleetStats ? String(fleetStats.lowBatteryAlerts) : '—',
      change: 'Pin < 20%',
      isPositive: false,
      icon: Activity,
      colorClass: 'bg-red-100 text-red-600',
    },
  ];

  // ── Fleet pie chart data ─────────────────────────────────────────
  const fleetPieData = fleetStats
    ? Object.entries(FLEET_COLORS)
        .map(([key, { color, label }]) => ({
          name: label,
          value: fleetStats[key] ?? 0,
          color,
        }))
        .filter(d => d.value > 0)
    : [];

  const fleetTotal = fleetStats?.total ?? 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Tổng quan</h2>
          <p className="text-sm text-gray-500">Chào mừng quay trở lại, Admin!</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => loadAll(period)}
            disabled={loading}
            className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition text-gray-500"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Date filter */}
          <button
            onClick={handleDateFilter}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition text-gray-700 font-medium"
          >
            <Calendar size={18} className="text-gray-500" />
            {period === '30d' ? '30 ngày qua' : period === 'all' ? 'Tất cả' : '7 ngày qua'}
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className={`text-3xl font-bold text-gray-800 ${loading ? 'opacity-40' : ''}`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.colorClass}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium">
              <span
                className={`${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} flex items-center px-2 py-0.5 rounded-full`}
              >
                {stat.isPositive
                  ? <TrendingUp size={14} className="mr-1" />
                  : <ArrowDownRight size={14} className="mr-1" />}
                {stat.change}
              </span>
              {period !== 'all' && <span className="text-gray-400 ml-2 font-normal">so với kỳ trước</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Booking chờ duyệt banner (nếu có) */}
      {!loading && overview?.pendingBookings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-yellow-800">
          <Activity size={16} className="text-yellow-500 flex-shrink-0" />
          Có <strong className="mx-1">{overview.pendingBookings}</strong> booking đang chờ duyệt.
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DOANH THU CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Doanh thu &amp; Đặt xe</h3>
            <button
              onClick={handleViewDetails}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              Xem chi tiết
            </button>
          </div>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={formatRevenue} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name) =>
                      name === 'revenue'
                        ? [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']
                        : [value, 'Chuyến xe']
                    }
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* FLEET PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Tình trạng Đội xe</h3>
          <p className="text-gray-500 text-sm mb-6">Phân bổ xe hiện tại</p>
          <div className="flex-1 min-h-[200px] relative">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetPieData.length > 0 ? fleetPieData : [{ name: 'Chưa có dữ liệu', value: 1, color: '#E5E7EB' }]}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(fleetPieData.length > 0 ? fleetPieData : [{ color: '#E5E7EB' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-800">{fleetTotal}</span>
                <p className="text-xs text-gray-500">Tổng xe</p>
              </div>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {fleetPieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value} xe</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-6">Hoạt động mới nhất</h3>

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-8">Đang tải...</div>
        ) : recentList.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">Chưa có dữ liệu.</div>
        ) : (
          <div className="space-y-4">
            {recentList.map((item) => {
              const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, cls: 'bg-gray-50 text-gray-600' };
              const initials = item.customerName
                ? item.customerName.trim().charAt(0).toUpperCase()
                : item.userId?.charAt(0)?.toUpperCase() ?? '?';

              return (
                <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">{item.customerName ?? item.userId}</span>
                        {' '}đã đặt{' '}
                        <span className="font-semibold text-blue-600">{item.bookingCode}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {Number(item.totalAmount).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
