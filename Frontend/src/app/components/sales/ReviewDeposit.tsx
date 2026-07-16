import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowLeft, AlertTriangle, CheckCircle, FileCheck, X, FileText
} from "lucide-react";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { toast } from "sonner";

export function ReviewDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reg, setReg] = useState<SalesApplication | null>(null);

  // Rejection/Revision reason state
  const [reasonMode, setReasonMode] = useState<"revision" | "cancel" | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const regRef = new URLSearchParams(location.search).get("regRef");

  const backToDashboard = () => {
    navigate("/sales/registrations?tab=registrations");
  };

  const loadData = useCallback(async () => {
    if (!regRef) {
      setError("Thiếu mã hồ sơ đăng ký tham chiếu.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const applications = await salesApi.getApplications();
      const found = applications.find(
        (item) => item.applicationId.toLowerCase() === regRef.toLowerCase()
      );

      if (!found) {
        setError("Không tìm thấy hồ sơ đăng ký yêu cầu.");
        setLoading(false);
        return;
      }

      setReg(found);
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, [regRef]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async () => {
    if (!reg) return;
    try {
      setSubmitting(true);
      await salesApi.reviewDeposit(reg.applicationId);
      toast.success("Đã rà soát hồ sơ. Hệ thống thông báo Quản lý xác nhận.");
      backToDashboard();
    } catch (err) {
      toast.error("Rà soát hồ sơ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonSubmit = async () => {
    if (!reg || !reasonMode) return;
    const reason = reasonText.trim();
    if (!reason) {
      toast.warning("Vui lòng nhập lý do.");
      return;
    }

    try {
      setSubmitting(true);
      if (reasonMode === "revision") {
        await salesApi.requestApplicationRevision(reg.applicationId, reason);
        toast.success("Đã gửi yêu cầu bổ sung hồ sơ cho khách hàng.");
      } else {
        await salesApi.cancelApplication(reg.applicationId, reason);
        toast.success("Đã hủy hồ sơ thành công.");
      }
      backToDashboard();
    } catch (err) {
      toast.error("Thực hiện thao tác thất bại.");
    } finally {
      setSubmitting(false);
      setReasonMode(null);
      setReasonText("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (error || !reg) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-500" />
        <p className="font-semibold text-lg">{error || "Hồ sơ không khả dụng"}</p>
        <button
          onClick={backToDashboard}
          className="mt-4 px-4 py-2 bg-white border border-red-300 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-full text-yellow-800 text-xs font-semibold border border-yellow-100">
          <FileText className="w-3.5 h-3.5 text-yellow-600" />
          Màn hình rà soát hồ sơ cọc
        </div>
        <button
          onClick={backToDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại danh sách
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-yellow-600" />
            Rà soát hồ sơ cọc
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kiểm tra thông tin chi tiết và tình trạng hồ sơ trước khi chuyển tiếp cho Quản lý phê duyệt phòng trống.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Mã hồ sơ đăng ký", reg.applicationId],
              ["Khách hàng", reg.customerName],
              ["Số điện thoại liên lạc", reg.phoneNumber],
              ["Địa chỉ email", reg.email || "Chưa cung cấp"],
              ["Phòng đặt giữ đề xuất", reg.roomName || "Chưa chỉ định"],
              ["Khu vực mong muốn", reg.area || "Chưa rõ"],
              ["Sức chứa yêu cầu", `${reg.capacity} người`],
              ["Giới tính", reg.gender || "Chưa rõ"],
              ["Phân khúc giá mong muốn", reg.priceRange || "Chưa rõ"],
              ["Thời điểm nộp hồ sơ", new Date(reg.createdAt).toLocaleDateString("vi-VN")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">{label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {reg.appointmentAt && (
            <div className="rounded-xl border border-green-200 bg-green-50/55 p-3 text-xs text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>
                Khách đã hoàn thành xem phòng thực tế lúc: <strong className="font-semibold">{new Date(reg.appointmentAt).toLocaleString("vi-VN")}</strong>
              </span>
            </div>
          )}

          <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3 text-xs text-yellow-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý nghiệp vụ:</strong> Sau khi nhân viên Sales phê duyệt rà soát, hồ sơ sẽ lập tức được chuyển sang bộ phận Quản lý để rà soát kiểm tra trạng thái giường trống trên hệ thống.
            </span>
          </div>

          {reasonMode ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                {reasonMode === "revision" ? "Nhập lý do yêu cầu bổ sung hồ sơ" : "Nhập lý do hủy bỏ hồ sơ thuê"}
              </h4>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={
                  reasonMode === "revision"
                    ? "Nhập chi tiết thông tin còn thiếu (Vd: cần bổ sung CCCD người thuê chính...)"
                    : "Nhập lý do hủy bỏ hồ sơ này (Vd: khách đổi ý không thuê nữa...)"
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleReasonSubmit}
                  disabled={submitting}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors ${
                    reasonMode === "cancel" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                >
                  Xác nhận gửi
                </button>
                <button
                  onClick={() => {
                    setReasonMode(null);
                    setReasonText("");
                  }}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 bg-white"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 min-w-[150px] py-2.5 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" /> Xác nhận rà soát cọc
              </button>
              <button
                onClick={() => setReasonMode("revision")}
                disabled={submitting}
                className="py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" /> Yêu cầu bổ sung
              </button>
              <button
                onClick={() => setReasonMode("cancel")}
                disabled={submitting}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Hủy hồ sơ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
