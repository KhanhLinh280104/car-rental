import { useState } from "react";
import { AlertTriangle, Plus, Send, FileText, X, CheckCircle, Clock, Eye, Upload } from "lucide-react";

export default function DriverReport() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    reportType: "damage",
    title: "",
    description: "",
    severity: "medium",
    location: "",
    reportDate: new Date().toISOString().split("T")[0],
    attachments: [],
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [reports, setReports] = useState([
    {
      id: "RPT001",
      type: "damage",
      title: "Xước cản trước bên phải",
      description: "Phát hiện vết xước sâu khi kiểm tra xe buổi sáng",
      severity: "medium",
      location: "Quận 1",
      date: "02/02/2026",
      status: "Đang xử lý",
      createdAt: "02/02/2026 08:30",
      image: "scratch-front.jpg",
    },
    {
      id: "RPT002",
      type: "accident",
      title: "Va chạm nhẹ tại giao lộ",
      description: "Va chạm với xe khác tại ngã tư Lê Lợi - Nguyễn Huệ",
      severity: "high",
      location: "Quận 1",
      date: "01/02/2026",
      status: "Đã giải quyết",
      createdAt: "01/02/2026 15:45",
      image: "accident-scene.jpg",
    },
    {
      id: "RPT003",
      type: "complaint",
      title: "Khiếu nại từ khách hàng",
      description: "Khách hàng cho rằng tài xế lái quá nhanh",
      severity: "low",
      location: "Quận 3",
      date: "31/01/2026",
      status: "Đã giải quyết",
      createdAt: "31/01/2026 20:15",
      image: null,
    },
    {
      id: "RPT004",
      type: "vehicle",
      title: "Lốp xe bị xẹp",
      description: "Lốp sau bên trái bị xẹp khi lái, phải thay lốp dự phòng",
      severity: "high",
      location: "Quốc lộ 1",
      date: "30/01/2026",
      status: "Đang xử lý",
      createdAt: "30/01/2026 10:20",
      image: "tire-damage.jpg",
    },
  ]);

  const reportTypes = [
    { id: "damage", label: "Hư hại xe", icon: "🚗" },
    { id: "accident", label: "Sự cố giao thông", icon: "⚠️" },
    { id: "complaint", label: "Khiếu nại khách hàng", icon: "😠" },
    { id: "vehicle", label: "Vấn đề kỹ thuật", icon: "🔧" },
    { id: "other", label: "Khác", icon: "📋" },
  ];

  const severityLevels = [
    { id: "low", label: "Thấp", color: "bg-green-100 text-green-700" },
    { id: "medium", label: "Trung bình", color: "bg-yellow-100 text-yellow-700" },
    { id: "high", label: "Cao", color: "bg-red-100 text-red-700" },
  ];

  const statusStyles = {
    "Đang xử lý": "bg-blue-100 text-blue-700",
    "Đã giải quyết": "bg-green-100 text-green-700",
    "Chờ duyệt": "bg-yellow-100 text-yellow-700",
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "Đang xử lý").length,
    resolved: reports.filter((r) => r.status === "Đã giải quyết").length,
    highSeverity: reports.filter((r) => r.severity === "high").length,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files.map((f) => f.name)],
    }));
  };

  const handleSubmitReport = () => {
    if (!formData.title || !formData.description) {
      setErrorMessage("Vui lòng điền đầy đủ tiêu đề và mô tả!");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const newReport = {
      id: `RPT${String(reports.length + 1).padStart(3, "0")}`,
      type: formData.reportType,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      location: formData.location,
      date: formData.reportDate,
      status: "Chờ duyệt",
      createdAt: new Date().toLocaleString("vi-VN"),
      image: null,
    };

    setReports((prev) => [newReport, ...prev]);
    setSuccessMessage("Báo cáo được gửi thành công! Chúng tôi sẽ xử lý sớm nhất.");
    setFormData({
      reportType: "damage",
      title: "",
      description: "",
      severity: "medium",
      location: "",
      reportDate: new Date().toISOString().split("T")[0],
      attachments: [],
    });
    setShowReportForm(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const filteredReports = reports.filter((report) => {
    if (filterStatus === "all") return true;
    return report.status === filterStatus;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
          <AlertTriangle className="text-red-500" size={36} />
          <span>Báo cáo sự cố & hư hại</span>
        </h1>
        <p className="text-gray-600">Báo cáo các vấn đề phát sinh cho nhân viên quản lý</p>
      </div>

      {/* === SUCCESS MESSAGE === */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* === ERROR MESSAGE === */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertTriangle className="text-red-600" size={20} />
          <span className="text-red-700 font-medium">{errorMessage}</span>
        </div>
      )}

      {/* === STATISTICS === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Tổng báo cáo</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-600 mt-2">Tất cả các báo cáo</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">Đang xử lý</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-600 mt-2">Chờ giải quyết</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Đã giải quyết</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          <p className="text-xs text-gray-600 mt-2">Xử lý xong</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border border-red-200">
          <p className="text-sm text-gray-600 mb-2">Mức độ cao</p>
          <p className="text-3xl font-bold text-red-600">{stats.highSeverity}</p>
          <p className="text-xs text-gray-600 mt-2">Báo cáo cần chú ý</p>
        </div>
      </div>

      {/* === NEW REPORT BUTTON === */}
      {!showReportForm && (
        <div className="mb-8">
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow-md"
          >
            <Plus size={20} />
            <span>Gửi báo cáo mới</span>
          </button>
        </div>
      )}

      {/* === REPORT FORM === */}
      {showReportForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Tạo báo cáo mới</h2>
            <button
              onClick={() => setShowReportForm(false)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại báo cáo *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, reportType: type.id }))
                    }
                    className={`p-3 rounded-lg text-center font-medium transition ${
                      formData.reportType === type.id
                        ? "bg-red-500 text-white border-2 border-red-600"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề báo cáo ngắn gọn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết về sự cố, hư hại hoặc vấn đề phát sinh..."
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              ></textarea>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm xảy ra
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Nhập địa điểm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày xảy ra
                </label>
                <input
                  type="date"
                  name="reportDate"
                  value={formData.reportDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mức độ nghiêm trọng *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {severityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, severity: level.id }))
                    }
                    className={`p-3 rounded-lg font-medium transition ${
                      formData.severity === level.id
                        ? level.color + " ring-2 ring-offset-2 ring-red-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đính kèm hình ảnh/tệp
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600">
                    Nhấp để chọn hoặc kéo thả tệp
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)
                  </p>
                </label>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                    >
                      <FileText size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{file}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmitReport}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
              >
                <Send size={18} />
                <span>Gửi báo cáo</span>
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === FILTERS === */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
          <div className="flex flex-wrap gap-3">
            {["all", "Chờ duyệt", "Đang xử lý", "Đã giải quyết"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "Tất cả" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === REPORTS LIST === */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {reportTypes.find((t) => t.id === report.type)?.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500">#{report.id}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{report.description}</p>

                  <div className="flex flex-wrap gap-3 items-center mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        severityLevels.find((s) => s.id === report.severity)
                          ?.color
                      }`}
                    >
                      {severityLevels.find((s) => s.id === report.severity)?.label}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusStyles[report.status]
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{report.createdAt}</span>
                    </span>
                  </div>

                  {report.location && (
                    <p className="text-sm text-gray-600">
                      📍 Địa điểm: {report.location}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowDetailModal(report)}
                  className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium whitespace-nowrap"
                >
                  <Eye size={18} />
                  <span>Chi tiết</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 font-medium">Không có báo cáo nào</p>
          </div>
        )}
      </div>

      {/* === DETAIL MODAL === */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết báo cáo
              </h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mã báo cáo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {showDetailModal.id}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    statusStyles[showDetailModal.status]
                  }`}
                >
                  {showDetailModal.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Tiêu đề</p>
                <p className="text-xl font-bold text-gray-800">
                  {showDetailModal.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Mô tả chi tiết</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {showDetailModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Mức độ</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      severityLevels.find((s) => s.id === showDetailModal.severity)
                        ?.color
                    }`}
                  >
                    {severityLevels.find((s) => s.id === showDetailModal.severity)
                      ?.label}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ngày báo cáo</p>
                  <p className="text-gray-800 font-medium">{showDetailModal.date}</p>
                </div>
              </div>

              {showDetailModal.location && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Địa điểm</p>
                  <p className="text-gray-800 font-medium">
                    📍 {showDetailModal.location}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Thời gian tạo</p>
                <p className="text-gray-800 font-medium">
                  {showDetailModal.createdAt}
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(null)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
