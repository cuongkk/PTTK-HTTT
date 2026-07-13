import { useState, useEffect } from "react";
import { Calculator, DollarSign, AlertCircle, CheckCircle, FileText, Banknote, CreditCard, Send, Printer, Search } from "lucide-react";
import { accountantService, ReconciliationListItem } from "../../services/accountantService";

export function Reconciliation() {
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");

  const [selectedContract, setSelectedContract] = useState<ReconciliationListItem | null>(null);
  const [deductions, setDeductions] = useState({ damages: "", utilities: "", rentArrears: "", violationFines: "", otherDeductions: "", otherDeductionsNote: "", notes: "" });
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

  const handleCalculateClick = (contract: ReconciliationListItem) => {
    setSelectedContract(contract);
    setDeductions({
      damages: contract.damages.toString(),
      utilities: contract.unpaidUtilities.toString(),
      rentArrears: contract.rentArrears.toString(),
      violationFines: contract.violationFines.toString(),
      otherDeductions: contract.otherDeductions.toString(),
      otherDeductionsNote: contract.otherDeductionsNote || "",
      notes: ""
    });
    setShowCalcModal(true);
  };

  const handleConfirmCalculate = async () => {
    if (!selectedContract) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xác nhận và lưu các khoản khấu trừ quyết toán này cho hợp đồng ${selectedContract.contractId}?`)) {
      return;
    }
    try {
      await accountantService.saveReconciliationDeductions({
        reconciliationId: selectedContract.reconciliationId,
        damages: Number(deductions.damages) || 0,
        utilities: Number(deductions.utilities) || 0,
        rentArrears: Number(deductions.rentArrears) || 0,
        violationFines: Number(deductions.violationFines) || 0,
        otherDeductions: Number(deductions.otherDeductions) || 0,
        otherDeductionsNote: deductions.otherDeductionsNote,
      });
      alert(`Đã tính toán quyết toán cho hợp đồng ${selectedContract.contractId} thành công!`);
      setShowCalcModal(false);
      setSelectedContract(null);
      loadReconciliations();
    } catch (err) {
      console.error("Lỗi khi lưu khoản khấu trừ đối soát:", err);
      alert("Đã xảy ra lỗi khi lưu khoản khấu trừ.");
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
    if (!window.confirm(`Bạn có chắc chắn muốn xác nhận thực hiện hoàn cọc số tiền ${selectedContract.refundAmount.toLocaleString()} VNĐ bằng hình thức ${methodStr} cho khách hàng ${selectedContract.customerName} không?`)) {
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
        <h1 className="text-3xl font-bold text-gray-900">Đối soát trả phòng</h1>
      </div>


      {/* Pending Reconciliations */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách đối soát</h2>
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["Tất cả", "Chờ tính toán", "Chờ xử lý"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {reconciliationsList
          .filter(
            (recon) =>
              (activeTab === "Tất cả" || recon.status === activeTab) &&
              (recon.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recon.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recon.contractId.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((recon) => (
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
                    className={`px-3 py-1 text-sm font-medium rounded-full ${recon.status === "Chờ tính toán"
                        ? "bg-orange-100 text-orange-700"
                        : (recon.status === "Chờ xử lý" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")
                      }`}
                  >
                    {recon.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Chi tiết hợp đồng thuê</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày nhận phòng:</span>
                        <span className="font-medium text-gray-900">{recon.moveInDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày trả phòng:</span>
                        <span className="font-medium text-gray-900">{recon.moveOutDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá phòng gốc/tháng:</span>
                        <span className="font-medium text-gray-900">{recon.monthlyRent.toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin đối soát tài chính</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền hoàn cơ bản ({recon.refundRate}%):</span>
                        <span className="font-medium text-green-600">+{recon.baseRefundAmount.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khấu trừ hư hại tài sản:</span>
                        <span className="font-medium text-red-600">-{recon.damages.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khấu trừ điện nước:</span>
                        <span className="font-medium text-red-600">-{recon.unpaidUtilities.toLocaleString()} VNĐ</span>
                      </div>
                      {(recon.rentArrears > 0) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nợ tiền phòng lưu trú:</span>
                          <span className="font-medium text-red-600">-{recon.rentArrears.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                      {(recon.violationFines > 0) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Khấu trừ vi phạm:</span>
                          <span className="font-medium text-red-600">-{recon.violationFines.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                      {(recon.otherDeductions > 0) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Khấu trừ khác {recon.otherDeductionsNote ? `(${recon.otherDeductionsNote})` : ""}:</span>
                          <span className="font-medium text-red-600">-{recon.otherDeductions.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 flex justify-between">
                        <span className="font-semibold text-gray-900">{recon.refundAmount >= 0 ? "Tiền cọc trả lại khách:" : "Khách cần nộp thêm:"}</span>
                        <span className={`font-bold ${recon.refundAmount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                          {recon.refundAmount >= 0 ? "" : "-"}{Math.abs(recon.refundAmount).toLocaleString()} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {recon.damages > 0 && recon.status === "Chờ xử lý" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 mb-1">Ghi nhận hư hại phòng</p>
                        <p className="text-sm text-red-700">
                          Bộ phận Quản lý ghi nhận hư hại tài sản trong biên bản là {recon.damages.toLocaleString()} VNĐ.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {recon.status === "Chờ tính toán" && (
                    <button
                      onClick={() => handleCalculateClick(recon)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Nhập khoản khấu trừ
                    </button>
                  )}

                  {recon.status === "Chờ xử lý" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedContract(recon);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Xem báo cáo đối soát
                      </button>
                      {recon.refundAmount >= 0 ? (
                        <button
                          onClick={() => handleRefundClick(recon)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Xử lý hoàn tiền
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Bạn có chắc chắn muốn phát hành yêu cầu thanh toán thu thêm số tiền ${Math.abs(recon.refundAmount).toLocaleString()} VNĐ cho khách hàng không?`)) {
                              return;
                            }
                            try {
                              await accountantService.createInvoiceRequest({
                                customerId: recon.customerId,
                                reconciliationId: recon.reconciliationId,
                                invoiceType: "thu_them",
                                totalAmount: Math.abs(recon.refundAmount),
                                notes: `Yêu cầu thu thêm tiền chênh lệch đối soát trả phòng hợp đồng ${recon.contractId}.`
                              });
                              alert(`Đã phát hành yêu cầu thanh toán thêm số tiền ${Math.abs(recon.refundAmount).toLocaleString()} VNĐ cho khách hàng!`);
                              loadReconciliations();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Gửi yêu cầu thanh toán thêm
                        </button>
                      )}
                    </>
                  )}

                  {recon.status === "Đã hoàn thành" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedContract(recon);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Xem báo cáo quyết toán
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContract(recon);
                          setRefundInfo({
                            method: recon.refundMethod || "transfer",
                            bankName: recon.bankName || "",
                            accountNumber: recon.accountNumber || "",
                            accountName: recon.customerName || ""
                          });
                          setShowVoucherModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                      >
                        <Banknote className="w-4 h-4" />
                        Xem phiếu chi
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Calculate Deductions Modal */}
      {showCalcModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calculator className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nhập khoản khấu trừ</h2>
                <p className="text-sm text-gray-600">
                  {selectedContract.contractId} — {selectedContract.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hư hại tài sản (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions.damages}
                    onChange={(e) => setDeductions({ ...deductions, damages: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nợ điện nước (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions.utilities}
                    onChange={(e) => setDeductions({ ...deductions, utilities: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nợ tiền phòng (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions.rentArrears}
                    onChange={(e) => setDeductions({ ...deductions, rentArrears: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phí vi phạm (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions.violationFines}
                    onChange={(e) => setDeductions({ ...deductions, violationFines: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div className={Number(deductions.otherDeductions) > 0 ? "md:col-span-1" : "md:col-span-2"}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khấu trừ khác (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions.otherDeductions}
                    onChange={(e) => setDeductions({ ...deductions, otherDeductions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
                {Number(deductions.otherDeductions) > 0 && (
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chi tiết lý do khác</label>
                    <input
                      type="text"
                      value={deductions.otherDeductionsNote}
                      onChange={(e) => setDeductions({ ...deductions, otherDeductionsNote: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nhập lý do..."
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Tiền hoàn cơ bản ({selectedContract.refundRate}%):</span>
                  <span className="font-medium text-gray-900">{selectedContract.baseRefundAmount.toLocaleString()} VNĐ</span>
                </div>
                {(() => {
                  const totalDeductions = Number(deductions.damages) + Number(deductions.utilities) + Number(deductions.rentArrears) + Number(deductions.violationFines) + Number(deductions.otherDeductions);
                  const finalAmount = selectedContract.baseRefundAmount - totalDeductions;
                  return (
                    <div className="flex justify-between items-center text-lg mt-4 pt-4 border-t border-gray-200">
                      <span>{finalAmount >= 0 ? "Tiền hoàn dự kiến:" : "Tiền thu thêm dự kiến:"}</span>
                      <span className={`font-bold ${finalAmount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        {finalAmount >= 0 ? "" : "-"}{Math.abs(finalAmount).toLocaleString()} VNĐ
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCalcModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCalculate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Xác nhận & Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chi trả tiền hoàn cọc</h2>
            <p className="text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
              Số tiền thanh lý: <span className="font-bold text-blue-600">{selectedContract.refundAmount.toLocaleString()} VNĐ</span> cho khách hàng {selectedContract.customerName}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức chi tiền</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "transfer" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${refundInfo.method === "transfer"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Chuyển khoản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "cash" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${refundInfo.method === "cash"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-medium">Tiền mặt</span>
                  </button>
                </div>
              </div>

              {refundInfo.method === "transfer" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngân hàng thụ hưởng</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.bankName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: Vietcombank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản nhận</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountNumber}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nhập số tài khoản"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ tài khoản nhận</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Tên không dấu"
                    />
                  </div>
                </div>
              )}

              {refundInfo.method === "cash" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm mt-4">
                  Lưu ý: Chỉ chi tiền mặt khi có sự xác nhận ký tá trực tiếp của khách hàng tại quầy.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isProcessing ? "Đang xử lý..." : (refundInfo.method === "transfer" ? "Xác nhận chuyển khoản" : "Chi tiền mặt")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal (Phiếu chi) */}
      {showVoucherModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Phiếu chi tiền hoàn cọc</h2>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Mã chứng từ chi</p>
                <p className="font-mono font-bold text-gray-900">VCHR-{new Date().getFullYear()}-{selectedContract.reconciliationId}</p>
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
                <p className="text-sm text-gray-500 mt-1">Hợp đồng liên quan: <span className="font-mono">{selectedContract.contractId}</span></p>
              </div>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Khách thuê</p>
                    <p className="font-medium text-gray-900">{selectedContract.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phòng xếp</p>
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
                      <span className="font-medium text-green-600">+{selectedContract.baseRefundAmount.toLocaleString()} VNĐ</span>
                    </div>

                    <div className="pl-4 py-2 my-2 border-l-2 border-gray-200 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Các khoản đã khấu trừ</p>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hư hại tài sản phòng:</span>
                        <span className="font-medium text-red-600">-{selectedContract.damages.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nợ điện nước dịch vụ:</span>
                        <span className="font-medium text-red-600">-{selectedContract.unpaidUtilities.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nợ tiền phòng lưu trú:</span>
                        <span className="font-medium text-red-600">-{selectedContract.rentArrears.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phạt vi phạm quy định:</span>
                        <span className="font-medium text-red-600">-{selectedContract.violationFines.toLocaleString()} VNĐ</span>
                      </div>
                      {selectedContract.otherDeductions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Khấu trừ khác {selectedContract.otherDeductionsNote ? `(${selectedContract.otherDeductionsNote})` : ""}:</span>
                          <span className="font-medium text-red-600">-{selectedContract.otherDeductions.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-lg pt-4 border-t border-gray-200">
                      <span className="font-bold text-gray-900">{selectedContract.refundAmount >= 0 ? "Tiền cọc chi trả lại khách" : "Số tiền thu thêm của khách"}</span>
                      <span className={`text-xl font-bold ${selectedContract.refundAmount >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        {selectedContract.refundAmount >= 0 ? "" : "-"}{Math.abs(selectedContract.refundAmount).toLocaleString()} VNĐ
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
