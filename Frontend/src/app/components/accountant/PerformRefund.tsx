import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, FileText, Banknote, CreditCard, Printer, Search } from "lucide-react";
import { accountantService, ReconciliationListItem } from "../../services/accountantService";

export function PerformRefund() {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState("Chờ xử lý");

  const [selectedContract, setSelectedContract] = useState<ReconciliationListItem | null>(null);
  const [refundInfo, setRefundInfo] = useState({ method: "transfer", bankName: "", accountNumber: "", accountName: "" });

  const [reconciliationsList, setReconciliationsList] = useState<ReconciliationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadReconciliations() {
    try {
      const data = await accountantService.getReconciliations();
      setReconciliationsList(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách quyết toán:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReconciliations();
  }, []);

  const handleZeroAmountConfirm = async (recon: ReconciliationListItem) => {
    if (!window.confirm(`Xác nhận hoàn tất quyết toán không phát sinh thu chi cho hợp đồng ${recon.contractId}?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await accountantService.processRefund({
        reconciliationId: recon.reconciliationId,
        method: "cash",
      });
      alert(`Quyết toán cho hợp đồng ${recon.contractId} đã hoàn tất thành công!`);
      loadReconciliations();
    } catch (err) {
      console.error("Lỗi khi hoàn tất quyết toán:", err);
      alert("Có lỗi xảy ra khi hoàn tất quyết toán.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefundClick = (contract: ReconciliationListItem) => {
    setSelectedContract(contract);
    setRefundInfo({
      method: "transfer",
      bankName: contract.bankName || "",
      accountNumber: contract.accountNumber || "",
      accountName: contract.customerName || "",
    });
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const methodStr = refundInfo.method === "transfer" ? "chuyển khoản" : "tiền mặt";
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xác nhận thực hiện hoàn cọc số tiền ${selectedContract.refundAmount.toLocaleString()} VNĐ bằng hình thức ${methodStr} cho khách hàng ${
          selectedContract.customerName
        } không?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await accountantService.processRefund({
        reconciliationId: selectedContract.reconciliationId,
        method: refundInfo.method as "transfer" | "cash",
        bankName: refundInfo.method === "transfer" ? refundInfo.bankName : undefined,
        accountNumber: refundInfo.method === "transfer" ? refundInfo.accountNumber : undefined,
        accountName: refundInfo.method === "transfer" ? refundInfo.accountName : undefined,
      });

      setShowRefundModal(false);
      setShowVoucherModal(true);
      loadReconciliations();
    } catch (err) {
      console.error("Lỗi khi xử lý chi hoàn tiền:", err);
      alert("Đã xảy ra lỗi khi xử lý chi hoàn tiền.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmVoucher = () => {
    alert(`Đã tạo phiếu chi thành công! Quá trình quyết toán hoàn tất.`);
    setShowVoucherModal(false);
    setSelectedContract(null);
  };

  // Lọc chỉ lấy các bản ghi có refundAmount >= 0 (các khoản hoàn cọc / hoàn cọc 0đ)
  const filteredRefunds = reconciliationsList.filter((recon) => {
    const matchesSearch =
      recon.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recon.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recon.contractId.toLowerCase().includes(searchTerm.toLowerCase());

    const isRefundItem = recon.refundAmount >= 0;

    if (activeStatusTab === "Tất cả") {
      return isRefundItem && (recon.status === "Chờ xử lý" || recon.status === "Đã hoàn thành") && matchesSearch;
    } else {
      return isRefundItem && recon.status === activeStatusTab && matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Hoàn cọc</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách hoàn tiền cọc</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Tabs Trạng thái */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["Chờ xử lý", "Đã hoàn thành", "Tất cả"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeStatusTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredRefunds.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-550 shadow-sm">
            Không có thông tin hoàn cọc nào trong danh mục này.
          </div>
        ) : (
          filteredRefunds.map((recon) => (
            <div
              key={recon.reconciliationId}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Mã hợp đồng: {recon.contractId} — {recon.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">{recon.roomName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      recon.status === "Chờ xử lý" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {recon.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-200 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500 block mb-1 font-medium">Tiền cọc trả lại khách:</span>
                    <span className="text-2xl font-black text-green-600">
                      {recon.refundAmount.toLocaleString()} VNĐ
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    {recon.status === "Chờ xử lý" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedContract(recon);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          Xem báo cáo đối soát
                        </button>

                        {recon.refundAmount > 0 ? (
                          <button
                            onClick={() => handleRefundClick(recon)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Xử lý hoàn tiền
                          </button>
                        ) : (
                          <button
                            onClick={() => handleZeroAmountConfirm(recon)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Xác nhận hoàn tất
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedContract(recon);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          Xem báo cáo quyết toán
                        </button>
                        {recon.refundAmount !== 0 && (
                          <button
                            onClick={() => {
                              setSelectedContract(recon);
                              setRefundInfo({
                                method: recon.refundMethod || "transfer",
                                bankName: recon.bankName || "",
                                accountNumber: recon.accountNumber || "",
                                accountName: recon.customerName || "",
                              });
                              setShowVoucherModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm shadow-sm"
                          >
                            <Banknote className="w-4 h-4" />
                            Xem phiếu chi
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Process Refund Modal */}
      {showRefundModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chi trả tiền hoàn cọc</h2>
            <p className="text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
              Số tiền thanh lý:{" "}
              <span className="font-bold text-blue-600">{selectedContract.refundAmount.toLocaleString()} VNĐ</span> cho
              khách hàng {selectedContract.customerName}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức chi tiền</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "transfer" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      refundInfo.method === "transfer"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Chuyển khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "cash" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      refundInfo.method === "cash"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    Tiền mặt
                  </button>
                </div>
              </div>

              {refundInfo.method === "transfer" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.bankName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Ví dụ: Vietcombank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountNumber}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Nhập số tài khoản"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Nhập tên tài khoản"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                >
                  {isProcessing && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isProcessing ? "Đang xử lý..." : refundInfo.method === "transfer" ? "Xác nhận chuyển khoản" : "Chi tiền mặt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal (Phiếu chi) */}
      {showVoucherModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Phiếu chi tiền hoàn cọc</h2>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-550 mb-1">Mã chứng từ chi</p>
                <p className="font-mono font-bold text-gray-900">
                  VCHR-{new Date().getFullYear()}-{selectedContract.reconciliationId}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng nhận:</span>
                  <span className="font-medium text-gray-900">{selectedContract.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theo hợp đồng thuê:</span>
                  <span className="font-medium text-gray-900">{selectedContract.contractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức chi:</span>
                  <span className="font-medium text-gray-900 uppercase">
                    {refundInfo.method === "transfer" ? "Chuyển khoản ngân hàng" : "Tiền mặt"}
                  </span>
                </div>

                {refundInfo.method === "transfer" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngân hàng nhận:</span>
                      <span className="font-medium text-gray-900">{refundInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <span className="font-medium text-gray-900">{refundInfo.accountNumber}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-lg mt-6 pt-4 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Số tiền chi hoàn cọc:</span>
                  <span className="font-bold text-blue-600 text-xl">{selectedContract.refundAmount.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {selectedContract.status === "Đã hoàn thành" ? (
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowVoucherModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmVoucher}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    In & Tạo phiếu chi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Báo cáo quyết toán đối soát</h2>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
              <div className="text-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 uppercase">Biên bản thanh lý & Quyết toán</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Hợp đồng liên quan: <span className="font-mono">{selectedContract.contractId}</span>
                </p>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Khách thuê</p>
                    <p className="font-medium text-gray-900">{selectedContract.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-555 mb-1">Phòng xếp</p>
                    <p className="font-medium text-gray-900">{selectedContract.roomName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Ngày nhận phòng</p>
                    <p className="font-medium text-gray-900">{selectedContract.moveInDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Ngày trả phòng</p>
                    <p className="font-medium text-gray-900">{selectedContract.moveOutDate}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Chi tiết tài chính quyết toán</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền đặt cọc gốc:</span>
                      <span className="font-medium text-gray-900">{selectedContract.deposit.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền hoàn cơ bản ({selectedContract.refundRate}%):</span>
                      <span className="font-medium text-green-600">
                        +{selectedContract.baseRefundAmount.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="pl-4 py-2 my-2 border-l-2 border-gray-200 space-y-2">
                      <p className="text-xs font-semibold text-gray-550 uppercase tracking-wider mb-2">
                        Các khoản đã khấu trừ
                      </p>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hư hại tài sản phòng:</span>
                        <span className="font-medium text-red-600">{selectedContract.damages.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-650">Nợ điện nước dịch vụ:</span>
                        <span className="font-medium text-red-600">
                          -{selectedContract.unpaidUtilities.toLocaleString()} VNĐ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nợ tiền phòng lưu trú:</span>
                        <span className="font-medium text-red-600">-{selectedContract.rentArrears.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phạt vi phạm quy định:</span>
                        <span className="font-medium text-red-600">
                          -{selectedContract.violationFines.toLocaleString()} VNĐ
                        </span>
                      </div>
                      {selectedContract.otherDeductions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Khấu trừ khác {selectedContract.otherDeductionsNote ? `(${selectedContract.otherDeductionsNote})` : ""}:
                          </span>
                          <span className="font-medium text-red-600">
                            -{selectedContract.otherDeductions.toLocaleString()} VNĐ
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-lg pt-4 border-t border-gray-200">
                      <span className="font-bold text-gray-900">
                        {selectedContract.refundAmount >= 0 ? "Tiền cọc chi trả lại khách" : "Số tiền thu thêm của khách"}
                      </span>
                      <span
                        className={`text-xl font-bold ${selectedContract.refundAmount >= 0 ? "text-blue-600" : "text-red-600"}`}
                      >
                        {selectedContract.refundAmount >= 0 ? "" : "-"}{Math.abs(selectedContract.refundAmount).toLocaleString()}{" "}
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-200 text-center">
                  <div>
                    <p className="font-medium text-gray-900 mb-12">Chữ ký kế toán duyệt</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-12">Chữ ký khách hàng xác nhận</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                In báo cáo biên bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
