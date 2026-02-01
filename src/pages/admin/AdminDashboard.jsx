import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { DollarSign, Car, Users, Activity, TrendingUp, ArrowDownRight, Calendar, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2'; // Import thêm Swal

// --- 1. MOCK DATA (Tạo 2 bộ dữ liệu để giả lập đổi qua lại) ---
const DATA_7_DAYS = [
  { name: 'T2', revenue: 12000000, bookings: 4 },
  { name: 'T3', revenue: 15500000, bookings: 6 },
  { name: 'T4', revenue: 10000000, bookings: 3 },
  { name: 'T5', revenue: 18000000, bookings: 7 },
  { name: 'T6', revenue: 25000000, bookings: 12 },
  { name: 'T7', revenue: 32000000, bookings: 15 },
  { name: 'CN', revenue: 28000000, bookings: 14 },
];

const DATA_30_DAYS = [
  { name: 'Tuần 1', revenue: 95000000, bookings: 45 },
  { name: 'Tuần 2', revenue: 110000000, bookings: 52 },
  { name: 'Tuần 3', revenue: 85000000, bookings: 38 },
  { name: 'Tuần 4', revenue: 130000000, bookings: 60 },
];

const FLEET_STATUS_DATA = [
  { name: 'Sẵn sàng', value: 65, color: '#10B981' },
  { name: 'Đang thuê', value: 35, color: '#3B82F6' },
  { name: 'Bảo trì', value: 10, color: '#EF4444' },
];

const STATS = [
  { id: 1, title: "Tổng doanh thu", value: "140.5M", change: "+12.5%", isPositive: true, icon: DollarSign, colorClass: "bg-green-100 text-green-600" },
  { id: 2, title: "Tổng chuyến xe", value: "61", change: "+8.2%", isPositive: true, icon: Car, colorClass: "bg-blue-100 text-blue-600" },
  { id: 3, title: "Khách hàng mới", value: "128", change: "-2.4%", isPositive: false, icon: Users, colorClass: "bg-purple-100 text-purple-600" },
  { id: 4, title: "Cảnh báo IoT", value: "3", change: "Cần xử lý", isPositive: false, icon: Activity, colorClass: "bg-red-100 text-red-600" },
];

const RECENT_ACTIVITIES = [
  { id: 1, user: "Nguyễn Văn A", action: "đã thanh toán", target: "VinFast VF8", time: "5 phút trước", amount: "+ 2.400.000 đ" },
  { id: 2, user: "Hệ thống AI", action: "cảnh báo pin yếu", target: "Tesla Model 3", time: "15 phút trước", amount: "⚠️ Low Battery" },
  { id: 3, user: "Trần Thị B", action: "vừa đặt xe", target: "Kia Carnival", time: "30 phút trước", amount: "Chờ duyệt" },
];

const AdminDashboard = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [timeRange, setTimeRange] = useState("7 ngày qua");
  const [chartData, setChartData] = useState(DATA_7_DAYS);

  // --- 2. XỬ LÝ NÚT CHỌN NGÀY (FILTER) ---
  const handleDateFilter = async () => {
    const { value: selectedRange } = await Swal.fire({
      title: 'Chọn khoảng thời gian',
      input: 'radio',
      inputOptions: {
        '7d': '7 ngày qua',
        '30d': '30 ngày qua (Tháng này)',
        'this_year': 'Năm nay'
      },
      inputValue: timeRange === '7 ngày qua' ? '7d' : '30d',
      showCancelButton: true,
      confirmButtonText: 'Áp dụng',
      cancelButtonText: 'Hủy'
    });

    if (selectedRange) {
      // Giả lập loading nhẹ cho chuyên nghiệp
      Swal.showLoading();
      setTimeout(() => {
        Swal.close();
        if (selectedRange === '30d') {
          setTimeRange("30 ngày qua");
          setChartData(DATA_30_DAYS); // Đổi dữ liệu biểu đồ
        } else {
          setTimeRange("7 ngày qua");
          setChartData(DATA_7_DAYS);  // Đổi dữ liệu biểu đồ
        }
        Swal.fire('Đã cập nhật', `Đang hiển thị dữ liệu ${selectedRange === '30d' ? '30 ngày qua' : '7 ngày qua'}`, 'success');
      }, 500);
    }
  };

  // --- 3. XỬ LÝ NÚT XEM CHI TIẾT (VIEW DETAILS) ---
  const handleViewDetails = () => {
    // Tạo bảng HTML từ dữ liệu hiện tại
    const tableRows = chartData.map(item => `
      <tr class="border-b">
        <td class="p-2 text-left">${item.name}</td>
        <td class="p-2 text-right font-bold text-blue-600">${item.revenue.toLocaleString()} đ</td>
        <td class="p-2 text-right">${item.bookings} chuyến</td>
      </tr>
    `).join('');

    Swal.fire({
      title: `Chi tiết doanh thu (${timeRange})`,
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
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Đóng lại'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Dashboard Tổng quan</h2>
           <p className="text-sm text-gray-500">Chào mừng quay trở lại, Admin!</p>
        </div>
        
        {/* NÚT 1: DATE FILTER */}
        <button 
          onClick={handleDateFilter}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition text-gray-700 font-medium"
        >
           <Calendar size={18} className="text-gray-500" />
           {timeRange}
           <ChevronDown size={16} />
        </button>
      </div>
      
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.colorClass}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium">
              <span className={`${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} flex items-center px-2 py-0.5 rounded-full`}>
                {stat.isPositive ? <TrendingUp size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />} 
                {stat.change}
              </span>
              <span className="text-gray-400 ml-2 font-normal">so với tuần trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DOANH THU CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-800 text-lg">Doanh thu & Đặt xe</h3>
             
             {/* NÚT 2: VIEW DETAILS */}
             <button 
               onClick={handleViewDetails}
               className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
             >
               Xem chi tiết
             </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}> {/* Dùng state chartData thay vì biến tĩnh */}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => [`${value.toLocaleString()} đ`, 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-2">Tình trạng Đội xe</h3>
          <p className="text-gray-500 text-sm mb-6">Phân bổ xe hiện tại</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={FLEET_STATUS_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {FLEET_STATUS_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-bold text-gray-800">120</span>
              <p className="text-xs text-gray-500">Tổng xe</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {FLEET_STATUS_DATA.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
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
        <div className="space-y-6">
           {RECENT_ACTIVITIES.map((item) => (
               <div key={item.id} className="flex justify-between items-start group">
                  <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                          {item.user.charAt(0)}
                      </div>
                      <div>
                          <p className="text-sm text-gray-800">
                            <span className="font-bold">{item.user}</span> {item.action} <span className="font-semibold text-blue-600">{item.target}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                             <Activity size={12}/> {item.time}
                          </p>
                      </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${item.amount.includes('Battery') ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-700'}`}>
                      {item.amount}
                  </span>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;