import { Loader2, X, AlertTriangle } from 'lucide-react';

const fmtDate = (s) =>
  s ? new Date(s).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
const fmtMoney = (n) =>
  n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

const InspectionHistoryModal = ({
  isOpen,
  title = 'Lịch sử giám định AI',
  historyItems = [],
  historyLoading = false,
  detailLoading = false,
  selectedDetail = null,
  onClose,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[480px]">
          <div className="md:col-span-1 border-r">
            <div className="px-4 py-3 border-b text-sm font-semibold text-gray-700">Danh sách bản scan</div>
            <div className="max-h-[420px] overflow-y-auto">
              {historyLoading ? (
                <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Đang tải lịch sử...
                </div>
              ) : historyItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">Chưa có bản scan nào.</div>
              ) : (
                historyItems.map((item) => (
                  <button
                    key={item.analysisId}
                    onClick={() => onSelectItem?.(item)}
                    className="w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800 text-sm">#{item.analysisId} · {item.stage}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.analysisStatus === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {item.analysisStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{fmtDate(item.createdAt)}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.inspectionAnalysis?.summary || item.comparison?.summary || item.errorMessage || 'Không có mô tả'}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 p-5 overflow-y-auto max-h-[480px]">
            {detailLoading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 size={18} className="animate-spin" /> Đang tải chi tiết...
              </div>
            ) : !selectedDetail ? (
              <div className="py-16 text-center text-sm text-gray-500">Chọn một bản scan để xem chi tiết.</div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 border rounded-lg p-4">
                  <div><p className="text-gray-500">Analysis ID</p><p className="font-semibold">{selectedDetail.analysisId}</p></div>
                  <div><p className="text-gray-500">Stage</p><p className="font-semibold">{selectedDetail.stage}</p></div>
                  <div><p className="text-gray-500">Status</p><p className="font-semibold">{selectedDetail.analysisStatus}</p></div>
                  <div><p className="text-gray-500">Thời gian</p><p className="font-semibold">{fmtDate(selectedDetail.createdAt)}</p></div>
                  <div><p className="text-gray-500">Provider</p><p className="font-semibold">{selectedDetail.provider || '—'}</p></div>
                  <div><p className="text-gray-500">Model</p><p className="font-semibold">{selectedDetail.model || '—'}</p></div>
                </div>

                {selectedDetail.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700">Lỗi AI</p>
                      <p className="text-red-600 text-xs mt-1">{selectedDetail.errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-blue-700 mb-2">Kết quả phân tích</p>
                  <p className="text-gray-700"><strong>Severity:</strong> {selectedDetail.inspectionAnalysis?.severity || '—'}</p>
                  <p className="text-gray-700"><strong>Confidence:</strong> {selectedDetail.inspectionAnalysis?.confidence ?? '—'}</p>
                  <p className="text-gray-700"><strong>Needs Manual Review:</strong> {selectedDetail.inspectionAnalysis?.needsManualReview ? 'Yes' : 'No'}</p>
                  <p className="text-gray-700"><strong>Recommended Fee:</strong> {fmtMoney(selectedDetail.inspectionAnalysis?.recommendedFee)}</p>
                  <p className="text-gray-700 mt-2"><strong>Summary:</strong> {selectedDetail.inspectionAnalysis?.summary || '—'}</p>
                </div>

                {selectedDetail.inspectionAnalysis?.damages?.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-100 font-semibold text-gray-700">Danh sách hư hại</div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left">Vị trí</th>
                          <th className="px-3 py-2 text-left">Loại</th>
                          <th className="px-3 py-2 text-left">Mức độ</th>
                          <th className="px-3 py-2 text-right">Phí ước tính</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDetail.inspectionAnalysis.damages.map((d, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2">{d.part || '—'}</td>
                            <td className="px-3 py-2">{d.type || '—'}</td>
                            <td className="px-3 py-2">{d.severity || '—'}</td>
                            <td className="px-3 py-2 text-right">{fmtMoney(d.estimatedFee)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedDetail.comparison && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-purple-700 mb-2">So sánh với baseline PICKUP</p>
                    <p className="text-gray-700"><strong>Baseline Found:</strong> {selectedDetail.comparison.baselineFound ? 'Yes' : 'No'}</p>
                    <p className="text-gray-700"><strong>Baseline Analysis ID:</strong> {selectedDetail.comparison.baselineAnalysisId ?? '—'}</p>
                    <p className="text-gray-700"><strong>New Damage Detected:</strong> {selectedDetail.comparison.newDamageDetected == null ? '—' : selectedDetail.comparison.newDamageDetected ? 'Yes' : 'No'}</p>
                    <p className="text-gray-700 mt-2"><strong>Summary:</strong> {selectedDetail.comparison.summary || '—'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionHistoryModal;
