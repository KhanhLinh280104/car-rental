import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp, DollarSign, Eye } from 'lucide-react';

/**
 * Reusable component to display AI inspection results
 * Props:
 *   - inspectionStatus: string (SUCCESS | RATE_LIMIT | TIMEOUT | RETRYABLE_ERROR | FEIGN_xxx | UNEXPECTED_ERROR)
 *   - inspectionSeverity: string (NONE | LOW | MEDIUM | HIGH)
 *   - comparisonSummary: string (null for PICKUP, has data for RETURN)
 *   - inspectionRecommendedFee: number
 *   - newDamageDetected: boolean (null for PICKUP, true/false for RETURN)
 *   - needsManualReview: boolean
 *   - inspectionStage: string (PICKUP | RETURN)
 *   - onFeeChange: function(newFee) - optional, for fee edit
 *   - editableFee: boolean - default false
 *   - comparisonDamages: array - damage changes from RETURN scan (NEW/EXISTING/RESOLVED)
 *   - showComparison: boolean - show damage comparison table (RETURN only)
 */
const InspectionResultsDisplay = ({
  inspectionStatus,
  inspectionSeverity,
  comparisonSummary,
  inspectionRecommendedFee = 0,
  newDamageDetected,
  needsManualReview,
  inspectionStage = 'PICKUP',
  onFeeChange,
  editableFee = false,
  comparisonDamages = [],
  showComparison = false,
  showRecommendedFee = true,
}) => {
  // ─── Severity badge styling ───────────────────────────────────────────
  const getSeverityBadge = (severity) => {
    const config = {
      NONE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '✓', label: 'Không có hư hại' },
      LOW: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '⚠', label: 'Hư hại nhẹ' },
      MEDIUM: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '⚠', label: 'Hư hại trung bình' },
      HIGH: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '⚠', label: 'Hư hại nặng' },
    };
    return config[severity] || config.NONE;
  };

  const getStatusMessage = (status) => {
    const msgs = {
      SUCCESS: 'AI phân tích thành công',
      RATE_LIMIT: 'Vượt quá giới hạn API (Rate Limit)',
      TIMEOUT: 'Phân tích bị timeout',
      RETRYABLE_ERROR: 'Lỗi tạm thời, có thể thử lại',
      UNEXPECTED_ERROR: 'Lỗi không xác định',
    };
    return msgs[status] || `Lỗi: ${status}`;
  };

  const isErrorStatus = status => status !== 'SUCCESS';
  const severityBadge = getSeverityBadge(inspectionSeverity);
  const fmtMoney = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '0 ₫';

  return (
    <div className="space-y-4">
      {/* ─── Status & Severity Header ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Status */}
        <div className={`rounded-lg border p-3 ${isErrorStatus(inspectionStatus) ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start gap-2">
            {isErrorStatus(inspectionStatus) ? (
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold text-sm ${isErrorStatus(inspectionStatus) ? 'text-red-700' : 'text-blue-700'}`}>
                {isErrorStatus(inspectionStatus) ? 'Phân tích AI' : 'Kết quả phân tích'}
              </p>
              <p className={`text-xs ${isErrorStatus(inspectionStatus) ? 'text-red-600' : 'text-blue-600'}`}>
                {getStatusMessage(inspectionStatus)}
              </p>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className={`rounded-lg border p-3 ${severityBadge.bg} border ${severityBadge.border}`}>
          <div className="flex items-start gap-2">
            <TrendingUp size={18} className={`${severityBadge.text} shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold text-sm ${severityBadge.text}`}>
                {severityBadge.label}
              </p>
              <p className={`text-xs ${severityBadge.text} opacity-75`}>
                Mức độ hư hại phát hiện
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Comparison Summary (RETURN only) ─────────────────── */}
      {inspectionStage === 'RETURN' && comparisonSummary && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Eye size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-purple-700">So sánh với tình trạng giao xe</p>
              <p className="text-sm text-purple-700 mt-1">{comparisonSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Damage Changes Table (RETURN only with comparison) ── */}
      {showComparison && comparisonDamages && comparisonDamages.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Vị trí</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Loại hư hại</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Mức độ</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700">Phí</th>
              </tr>
            </thead>
            <tbody>
              {comparisonDamages.map((damage, idx) => {
                const statusBadge = {
                  'NEW': { bg: 'bg-red-100', text: 'text-red-700', label: '🟢 Hư hại mới' },
                  'EXISTING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🟡 Còn lại' },
                  'RESOLVED': { bg: 'bg-gray-100', text: 'text-gray-700', label: '⚪ Đã hết' },
                };
                const badge = statusBadge[damage.status] || statusBadge.EXISTING;
                const severityColor = {
                  'NONE': 'text-green-600',
                  'LOW': 'text-yellow-600',
                  'MEDIUM': 'text-orange-600',
                  'HIGH': 'text-red-600',
                };
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className={`px-3 py-2 ${badge.bg} ${badge.text} font-semibold text-xs`}>
                      {badge.label}
                    </td>
                    <td className="px-3 py-2 text-gray-700"><strong>{damage.part}</strong></td>
                    <td className="px-3 py-2 text-gray-600">{damage.type}</td>
                    <td className={`px-3 py-2 font-semibold ${severityColor[damage.severity] || 'text-gray-700'}`}>
                      {damage.severity}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-600">
                      {damage.estimatedFee != null ? Number(damage.estimatedFee).toLocaleString('vi-VN') + ' ₫' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── New Damage Detected (RETURN only) ─────────────────── */}
      {inspectionStage === 'RETURN' && newDamageDetected === true && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-700">Phát hiện hư hại mới</p>
            <p className="text-xs text-red-600">Có hư hại được phát hiện so với tình trạng giao xe</p>
          </div>
        </div>
      )}

      {/* ─── Recommended Fee ─────────────────────────────────── */}
      {showRecommendedFee && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <p className="font-semibold text-sm text-green-700">Phí phục hồi được đề xuất</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              {editableFee ? (
                <input
                  type="number"
                  value={inspectionRecommendedFee}
                  onChange={(e) => onFeeChange?.(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-semibold text-lg"
                  min="0"
                />
              ) : (
                <p className="text-2xl font-bold text-green-700">{fmtMoney(inspectionRecommendedFee)}</p>
              )}
            </div>
            {editableFee && (
              <p className="text-xs text-green-600 pb-3">
                Staff có thể điều chỉnh trước khi xác nhận
              </p>
            )}
          </div>
          <p className="text-xs text-green-600 mt-2">
            💡 Đây là phí đề xuất để staff tham khảo, chưa phải phí chốt cuối cùng
          </p>
        </div>
      )}

      {/* ─── Manual Review Warning ────────────────────────────── */}
      {needsManualReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-700">Cần xem xét thủ công</p>
            <p className="text-xs text-amber-600">
              AI confidence thấp hoặc có lỗi — vui lòng review kỹ trước khi xác nhận
            </p>
          </div>
        </div>
      )}

      {/* ─── Error Details (if status is not SUCCESS) ─────────── */}
      {isErrorStatus(inspectionStatus) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-700">Phân tích AI gặp vấn đề</p>
            <p className="text-xs text-red-600 mt-1">
              Biên bản vẫn được tạo thành công, nhưng AI chưa thể phân tích.
              {needsManualReview && ' Staff cần xem xét thủ công và điều chỉnh phí nếu cần thiết.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionResultsDisplay;
