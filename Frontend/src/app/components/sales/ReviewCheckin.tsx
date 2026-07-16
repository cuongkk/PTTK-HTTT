import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowLeft, AlertTriangle, CheckCircle, FileCheck, X, FileText, AlertCircle
} from "lucide-react";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { toast } from "sonner";

export function ReviewCheckin() {
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

  const tenants = reg?.tenants ?? [];
  const registeredCapacity = reg?.capacity ?? 0;

  // Validation checks based on backend rules:
  // 1. Tenant count must match capacity: tenants.length === registeredCapacity
  const isCountValid = tenants.length === registeredCapacity;

  // 2. Exactly one primary tenant (representative)
  const primaryTenantCount = tenants.filter((t) => t.isPrimaryTenant).length;
  const isPrimaryTenantValid = primaryTenantCount === 1;

  // 3. Complete details for all members: NationalId, DocumentType, PermanentAddress, OccupationOrSchool must not be blank
  const isDetailsComplete = tenants.every(
    (t) =>
      t.nationalId &&
      t.nationalId.trim() !== "" &&
      t.documentType &&
      t.documentType.trim() !== "" &&
      t.permanentAddress &&
      t.permanentAddress.trim() !== "" &&
      t.occupationOrSchool &&
      t.occupationOrSchool.trim() !== ""
  );

  const isValidToCheckin = isCountValid && isPrimaryTenantValid && isDetailsComplete;

  const handleApprove = async () => {
    if (!reg) return;
    if (!isValidToCheckin) {
      toast.error("Hồ sơ người ở chưa đủ điều kiện đối chiếu. Vui lòng rà soát cảnh báo.");
      return;
    }

    try {
      setSubmitting(true);
      await salesApi.reviewCheckin(reg.applicationId);
      toast.success("Đã ghi nhận đối chiếu thành công. Chờ Quản lý duyệt nhận phòng.");
      backToDashboard();
    } catch (err) {
      toast.error("Ghi nhận đối chiếu nhận phòng thất bại.");
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
        toast.success("Đã gửi yêu cầu bổ sung hồ sơ nhận phòng cho khách hàng.");
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-indigo-800 text-xs font-semibold border border-indigo-100">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          Màn hình đối chiếu nhận phòng
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
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Đối chiếu hồ sơ nhận phòng
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kiểm tra thông tin chi tiết các thành viên ở thực tế và hồ sơ giấy tờ của khách thuê trước khi phê duyệt nhận phòng.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-600">
            <div>
              <p className="text-gray-400">Mã hồ sơ</p>
              <p className="font-bold text-gray-900 mt-0.5">{reg.applicationId}</p>
            </div>
            <div>
              <p className="text-gray-400">Phòng nhận</p>
              <p className="font-bold text-gray-900 mt-0.5">{reg.roomName}</p>
            </div>
            <div>
              <p className="text-gray-400">Số người đăng ký</p>
              <p className="font-bold text-gray-900 mt-0.5">{registeredCapacity} người</p>
            </div>
            <div>
              <p className="text-gray-400">Đã khai báo</p>
              <p className="font-bold text-gray-900 mt-0.5">{tenants.length} người ở</p>
            </div>
          </div>

          {/* Validation Checklist Alerts */}
          <div className="space-y-2">
            {!isCountValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>
                  <strong>Lỗi số lượng:</strong> Số người đã khai báo ({tenants.length}) chưa khớp với số người đăng ký ban đầu ({registeredCapacity}).
                </span>
              </div>
            )}

            {!isPrimaryTenantValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>
                  {primaryTenantCount === 0 ? (
                    <span><strong>Lỗi đại diện:</strong> Hồ sơ chưa cấu hình Người đại diện đứng tên thuê chính.</span>
                  ) : (
                    <span><strong>Lỗi đại diện:</strong> Hồ sơ chứa nhiều hơn 1 người đại diện ({primaryTenantCount} người). Cần chỉnh lại duy nhất 1 đại diện.</span>
                  )}
                </span>
              </div>
            )}

            {!isDetailsComplete && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span>
                  <strong>Thiếu thông tin:</strong> Một số thành viên chưa cung cấp đủ CCCD/Giấy tờ, loại giấy tờ, địa chỉ thường trú hoặc nghề nghiệp/trường học.
                </span>
              </div>
            )}

            {isValidToCheckin && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Hồ sơ người ở hoàn toàn hợp lệ và sẵn sàng phê duyệt.</span>
              </div>
            )}
          </div>

          {/* Tenant Members List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-1.5">Danh sách thành viên đăng ký cư trú</h3>
            {tenants.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                Khách hàng chưa gửi thông tin thành viên cư trú nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tenants.map((tenant, index) => {
                  const hasMissingInfo =
                    !tenant.nationalId ||
                    tenant.nationalId.trim() === "" ||
                    !tenant.documentType ||
                    tenant.documentType.trim() === "" ||
                    !tenant.permanentAddress ||
                    tenant.permanentAddress.trim() === "" ||
                    !tenant.occupationOrSchool ||
                    tenant.occupationOrSchool.trim() === "";

                  return (
                    <div
                      key={`${tenant.fullName}-${index}`}
                      className={`p-4 rounded-xl border bg-white flex flex-col justify-between ${
                        hasMissingInfo ? "border-yellow-300 shadow-xs" : "border-gray-200 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
                          <p className="font-bold text-gray-900 text-sm truncate">{tenant.fullName}</p>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase shrink-0 ${
                              tenant.isPrimaryTenant
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-600 border border-gray-250"
                            }`}
                          >
                            {tenant.isPrimaryTenant ? "Đại diện" : "Thành viên"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5 text-xs text-gray-600">
                          <p>
                            <span className="text-gray-400">Giới tính:</span>{" "}
                            <span className="font-semibold text-gray-800">{tenant.gender ?? "Chưa rõ"}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Quốc tịch:</span>{" "}
                            <span className="font-semibold text-gray-800">{tenant.nationality ?? "Chưa rõ"}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">CCCD/Giấy tờ:</span>{" "}
                            <span
                              className={`font-semibold ${
                                !tenant.nationalId ? "text-red-500 font-bold" : "text-gray-800"
                              }`}
                            >
                              {tenant.nationalId || "Thiếu thông tin"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-400">Loại giấy tờ:</span>{" "}
                            <span
                              className={`font-semibold ${
                                !tenant.documentType ? "text-red-500 font-bold" : "text-gray-800"
                              }`}
                            >
                              {tenant.documentType || "Thiếu thông tin"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-400">Ngày sinh:</span>{" "}
                            <span className="font-semibold text-gray-800">
                              {tenant.dateOfBirth
                                ? new Date(tenant.dateOfBirth).toLocaleDateString("vi-VN")
                                : "Chưa khai báo"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-400">Nghề nghiệp/Trường học:</span>{" "}
                            <span
                              className={`font-semibold ${
                                !tenant.occupationOrSchool ? "text-red-500 font-bold" : "text-gray-800"
                              }`}
                            >
                              {tenant.occupationOrSchool || "Thiếu thông tin"}
                            </span>
                          </p>
                          <p className="line-clamp-2">
                            <span className="text-gray-400">Thường trú:</span>{" "}
                            <span
                              className={`font-semibold ${
                                !tenant.permanentAddress ? "text-red-500 font-bold" : "text-gray-800"
                              }`}
                            >
                              {tenant.permanentAddress || "Thiếu thông tin"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {hasMissingInfo && (
                        <div className="mt-3 pt-2 border-t border-yellow-100 text-[10px] text-yellow-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                          <span>Một số trường bắt buộc đang bị bỏ trống.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {reasonMode ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
                {reasonMode === "revision" ? "Nhập lý do yêu cầu bổ sung hồ sơ nhận phòng" : "Nhập lý do hủy hồ sơ nhận phòng"}
              </h4>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={
                  reasonMode === "revision"
                    ? "Nhập chi tiết thông tin cần sửa (Vd: CCCD của thành viên thứ 2 bị mờ...)"
                    : "Nhập lý do hủy bỏ (Vd: khách từ chối bổ sung giấy tờ và muốn hủy hợp đồng...)"
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
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleApprove}
                disabled={submitting || !isValidToCheckin}
                className="flex-1 min-w-[180px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" /> Xác nhận đối chiếu nhận phòng
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
