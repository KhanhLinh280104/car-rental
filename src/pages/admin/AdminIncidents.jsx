import React, { useState } from 'react';
import { AlertTriangle, Check, X, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

const MOCK_INCIDENTS = [
  { id: "INC001", car: "VinFast VF8", reporter: "AI System", date: "01/02/2026", severity: "Medium", status: "Pending", desc: "Phát hiện vết xước cản trước bên phải." },
  { id: "INC002", car: "Tesla Model 3", reporter: "Khách hàng (Lê D)", date: "31/01/2026", severity: "High", status: "Resolved", desc: "Móp cửa sau do va chạm." },
  { id: "INC003", car: "Kia Carnival", reporter: "AI System", date: "02/02/2026", severity: "Low", status: "Pending", desc: "Áp suất lốp thấp bất thường." },
];

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  // Xử lý Sự cố
  const handleProcess = (item) => {
    Swal.fire({
      title: `Xử lý sự cố #${item.id}`,
      html: `
        <div class="text-left text-sm space-y-2 mb-4">
            <p><strong>Xe:</strong> ${item.car}</p>
            <p><strong>Báo cáo bởi:</strong> ${item.reporter}</p>
            <p><strong>Mô tả:</strong> ${item.desc}</p>
            <div class="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 mt-2">
               <span class="flex items-center gap-2"><Camera size={20}/> [Ảnh hiện trường giả lập]</span>
            </div>
        </div>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận hư hại & Phạt',
      denyButtonText: 'Báo cáo sai (Bỏ qua)',
      confirmButtonColor: '#d33',
      denyButtonColor: '#6B7280',
    }).then((result) => {
      if (result.isConfirmed) {
        setIncidents(incidents.map(i => i.id === item.id ? { ...i, status: 'Resolved' } : i));
        Swal.fire('Đã xử lý', 'Đã ghi nhận hư hại và gửi thông báo phạt.', 'success');
      } else if (result.isDenied) {
        setIncidents(incidents.map(i => i.id === item.id ? { ...i, status: 'Ignored' } : i));
        Swal.fire('Đã bỏ qua', 'Đánh dấu là báo cáo sai.', 'info');
      }
    });
  };

  const getSeverityColor = (level) => {
      if(level === 'High') return 'text-red-600 bg-red-50';
      if(level === 'Medium') return 'text-orange-600 bg-orange-50';
      return 'text-blue-600 bg-blue-50';
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Sự cố & Hư hại (AI Detection)</h2>
      <div className="grid gap-4">
        {incidents.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
             <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-full ${item.status === 'Pending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {item.car} <span className="text-xs text-gray-400 font-normal">#{item.id}</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    <div className="flex gap-2 mt-2 text-xs font-medium">
                        <span className={`px-2 py-1 rounded ${getSeverityColor(item.severity)}`}>Mức độ: {item.severity}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Nguồn: {item.reporter}</span>
                    </div>
                </div>
             </div>

             <div>
                {item.status === 'Pending' ? (
                    <button 
                        onClick={() => handleProcess(item)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm"
                    >
                        Xử lý ngay
                    </button>
                ) : (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                        <Check size={18}/> Đã giải quyết
                    </span>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminIncidents;