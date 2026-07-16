import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Calculator, AlertCircle, FileText, Send, Printer, Search } from "lucide-react";
import { accountantService, ReconciliationListItem } from "../../services/accountantService";

const parseDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const getStayDuration = (moveInStr?: string, moveOutStr?: string): { months: number; days: number; text: string } => {
  const moveIn = parseDate(moveInStr);
  const moveOut = parseDate(moveOutStr);
  if (!moveIn || !moveOut) return { months: 0, days: 0, text: "N/A" };

  const diffTime = moveOut.getTime() - moveIn.getTime();
  if (diffTime < 0) return { months: 0, days: 0, text: "0 ngày" };

  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let text = "";
  if (months > 0) {
    text += `${months} tháng `;
  }
  if (days > 0 || months === 0) {
    text += `${days} ngày`;
  }
  return { months, days, text };
};

const calculateProposedRefundRate = (recon: ReconciliationListItem): { rate: number; reason: string } => {
  if (recon.isDepositRefund) {
    return { rate: 80, reason: "Khách đã đặt cọc nhưng chưa ký hợp đồng" };
  }

  const moveIn = parseDate(recon.moveInDate);
  const moveOut = parseDate(recon.moveOutDate);
  const contractEnd = parseDate(recon.contractEndDate);

  if (!moveIn || !moveOut) {
    return { rate: 100, reason: "Hết hạn thuê theo hợp đồng" };
  }

  if (contractEnd && moveOut.getTime() >= contractEnd.getTime()) {
    return { rate: 100, reason: "Hết hạn thuê theo hợp đồng" };
  }

  const diffTime = moveOut.getTime() - moveIn.getTime();
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = totalDays / 30.0;

  if (months < 6.0) {
    return { rate: 50, reason: "Chưa hết hạn thuê, khách lưu trú dưới 6 tháng" };
  } else {
    return { rate: 70, reason: "Chưa hết hạn thuê, khách lưu trú trên 6 tháng" };
  }
};

export function CreateReconciliation() {
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get("search") || "";
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Chờ tính toán");

  const [selectedContract, setSelectedContract] = useState<ReconciliationListItem | null>(null);
  const [deductions, setDeductions] = useState({ damages: "", utilities: "", rentArrears: "", violationFines: "", otherDeductions: "", otherDeductionsNote: "", notes: "" });
  const [refundRate, setRefundRate] = useState(80);

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

  useEffect(() => {
    if (reconciliationsList.length > 0 && searchQ) {
      setSearchTerm(searchQ);
      const matched = reconciliationsList.find(
        (r) =>
          r.reconciliationId.toLowerCase() === searchQ.toLowerCase() ||
          r.contractId.toLowerCase() === searchQ.toLowerCase()
      );
      if (matched) {
        const isDebt = matched.refundAmount < 0 && (matched.status === "Chờ xử lý" || matched.status === "Đã hoàn thành");
        if (isDebt) {
          setActiveTab("Theo dõi thu thêm");
        } else {
          setActiveTab("Chờ tính toán");
          handleCalculateClick(matched);
        }
      }
    }
  }, [reconciliationsList, searchQ]);

  const handleCalculateClick = (contract: ReconciliationListItem) => {
    setSelectedContract(contract);
    const proposed = calculateProposedRefundRate(contract);
    setRefundRate(contract.refundRate || proposed.rate);
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
        refundRate: refundRate,
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

  const handleSubmitToManager = async (reconciliationId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi bảng đối soát quyết toán này đến Quản lý phê duyệt không?")) {
      return;
    }
    try {
      await accountantService.submitReconciliation(reconciliationId);
      alert("Đã gửi đối soát quyết toán đến Quản lý thành công!");
      loadReconciliations();
    } catch (err) {
      console.error("Lỗi khi gửi đối soát đến Quản lý:", err);
      alert("Đã xảy ra lỗi khi gửi đối soát.");
    }
  };

  const filteredReconciliations = reconciliationsList.filter((recon) => {
    const matchesSearch =
      recon.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recon.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recon.contractId.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "Chờ tính toán") {
      return recon.status === "Chờ tính toán" && matchesSearch;
    } else {
      // Theo dõi thu thêm: Số tiền hoàn cọc < 0
      return recon.refundAmount < 0 && (recon.status === "Chờ xử lý" || recon.status === "Đã hoàn thành") && matchesSearch;
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
        <h1 className="text-3xl font-bold text-gray-900">Lập đối soát</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === "Chờ tính toán" ? "Danh sách chờ đối soát" : "Danh sách khách nợ thu thêm"}
          </h2>
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
          {["Chờ tính toán", "Theo dõi thu thêm"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredReconciliations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-550 shadow-sm">
            Không có thông tin đối soát nào trong danh mục này.
          </div>
        ) : (
          filteredReconciliations.map((recon) => (
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
                      recon.status === "Chờ tính toán"
                        ? "bg-orange-100 text-orange-700"
                        : recon.status === "Chờ xử lý"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {recon.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-5 rounded-xl border border-gray-200 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500 block mb-1 font-medium">
                      {activeTab === "Chờ tính toán"
                        ? recon.isCalculated
                          ? recon.refundAmount >= 0
                            ? "Tiền cọc trả lại khách dự kiến:"
                            : "Khách cần nộp thêm dự kiến:"
                          : "Tiền cọc trả lại khách dự kiến:"
                        : "Khách cần nộp thêm:"}
                    </span>
                    {activeTab === "Chờ tính toán" && !recon.isCalculated ? (
                      <span className="text-gray-400 italic font-semibold">Chưa tính toán</span>
                    ) : (
                      <span className={`text-2xl font-black ${recon.refundAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {Math.abs(recon.refundAmount).toLocaleString()} VNĐ
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                    {activeTab === "Chờ tính toán" ? (
                      <>
                        <button
                          onClick={() => handleCalculateClick(recon)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                        >
                          <Calculator className="w-4 h-4" />
                          Nhập khoản khấu trừ
                        </button>
                        <button
                          disabled={!recon.isCalculated}
                          onClick={() => handleSubmitToManager(recon.reconciliationId)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm ${
                            recon.isCalculated
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          Gửi đến Quản lý
                        </button>
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
                          Xem báo cáo đối soát
                        </button>

                        {/* Các nút xử lý thu thêm */}
                        {!recon.invoiceId && (
                          <button
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Bạn có chắc chắn muốn phát hành yêu cầu thanh toán thu thêm số tiền ${Math.abs(
                                    recon.refundAmount
                                  ).toLocaleString()} VNĐ cho khách hàng không?`
                                )
                              ) {
                                return;
                              }
                              try {
                                await accountantService.createInvoiceRequest({
                                  customerId: recon.customerId,
                                  reconciliationId: recon.reconciliationId,
                                  invoiceType: "thu_them",
                                  totalAmount: Math.abs(recon.refundAmount),
                                  notes: `Yêu cầu thu thêm tiền chênh lệch đối soát trả phòng hợp đồng ${recon.contractId}.`,
                                });
                                alert(
                                  `Đã phát hành yêu cầu thanh toán thêm số tiền ${Math.abs(
                                    recon.refundAmount
                                  ).toLocaleString()} VNĐ cho khách hàng!`
                                );
                                loadReconciliations();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Gửi yêu cầu thanh toán thêm
                          </button>
                        )}

                        {recon.invoiceId && recon.invoiceStatus === "cho_thanh_toan" && !recon.invoiceHasProof && (
                          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center">
                            Chờ khách thanh toán
                          </span>
                        )}

                        {recon.invoiceId && recon.invoiceStatus === "cho_thanh_toan" && recon.invoiceHasProof && (
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center">
                            Chờ xác nhận thanh toán
                          </span>
                        )}

                        {recon.invoiceId && recon.invoiceStatus === "da_thanh_toan" && (
                          <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center">
                            Đã thu tiền (Hoàn tất quyết toán)
                          </span>
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

      {/* Calculate Deductions Modal */}
      {showCalcModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calculator className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nhập khoản khấu trừ quyết toán</h2>
                <p className="text-sm text-gray-600">
                  {selectedContract.contractId} — {selectedContract.customerName}
                </p>
              </div>
            </div>

            {/* Box thông tin tham chiếu hợp đồng và thời gian lưu trú */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mb-5 text-sm">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Thông tin đối soát & Thời gian lưu trú
              </h3>
              {selectedContract.isDepositRefund ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-blue-800">
                  <div>
                    Loại hồ sơ: <span className="font-bold text-gray-900">Phiếu đặt cọc (Chưa ký HĐ)</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-blue-800">
                  <div>
                    Ngày bắt đầu: <span className="font-bold text-gray-900">{selectedContract.moveInDate}</span>
                  </div>
                  <div>
                    Hạn hợp đồng: <span className="font-bold text-gray-900">{selectedContract.contractEndDate || "Không có"}</span>
                  </div>
                  <div>
                    Ngày trả thực tế: <span className="font-bold text-gray-900">{selectedContract.moveOutDate}</span>
                  </div>
                  <div>
                    Thời gian lưu trú:{" "}
                    <span className="font-bold text-gray-900">
                      {getStayDuration(selectedContract.moveInDate, selectedContract.moveOutDate).text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Banner Tỷ lệ hoàn cọc đề xuất */}
            {(() => {
              const info = calculateProposedRefundRate(selectedContract);
              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 text-sm flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 font-extrabold text-lg flex items-center justify-center min-w-[50px]">
                    {info.rate}%
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950">Tỷ lệ hoàn cọc đề xuất</h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">{info.reason}</p>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4 mb-6">
              {selectedContract.isDepositRefund ? null : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hư hại tài sản (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions.damages}
                      onChange={(e) => setDeductions({ ...deductions, damages: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nợ điện nước (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions.utilities}
                      onChange={(e) => setDeductions({ ...deductions, utilities: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nợ tiền phòng (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions.rentArrears}
                      onChange={(e) => setDeductions({ ...deductions, rentArrears: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phí vi phạm (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions.violationFines}
                      onChange={(e) => setDeductions({ ...deductions, violationFines: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className={Number(deductions.otherDeductions) > 0 ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Khấu trừ khác (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions.otherDeductions}
                      onChange={(e) => setDeductions({ ...deductions, otherDeductions: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  {Number(deductions.otherDeductions) > 0 && (
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Chi tiết lý do khác</label>
                      <input
                        type="text"
                        value={deductions.otherDeductionsNote}
                        onChange={(e) => setDeductions({ ...deductions, otherDeductionsNote: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập lý do..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tính toán hiển thị số tiền */}
              {(() => {
                const currentBaseRefund = Math.round(selectedContract.deposit * (refundRate / 100));
                const totalDeductions = selectedContract.isDepositRefund
                  ? 0
                  : Number(deductions.damages) +
                    Number(deductions.utilities) +
                    Number(deductions.rentArrears) +
                    Number(deductions.violationFines) +
                    Number(deductions.otherDeductions);
                const finalAmount = currentBaseRefund - totalDeductions;
                return (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 mt-4 text-xs space-y-1.5">
                      <div className="flex justify-between text-gray-600">
                        <span>Tiền đặt cọc gốc:</span>
                        <span className="font-semibold text-gray-900">{selectedContract.deposit.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tiền hoàn cọc đề xuất ({refundRate}%):</span>
                        <span className="font-semibold text-emerald-600">+{currentBaseRefund.toLocaleString()} VNĐ</span>
                      </div>
                      {!selectedContract.isDepositRefund && totalDeductions > 0 && (
                        <div className="flex justify-between text-gray-600 border-b border-dashed border-gray-200 pb-1.5">
                          <span>Tổng các khoản khấu trừ:</span>
                          <span className="font-semibold text-red-600">-{totalDeductions.toLocaleString()} VNĐ</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm pt-1.5 font-bold">
                        <span className="text-gray-800">
                          {finalAmount >= 0 ? "Tiền cọc trả lại khách dự kiến:" : "Tiền thu thêm dự kiến:"}
                        </span>
                        <span className={finalAmount >= 0 ? "text-emerald-600 text-base" : "text-red-600 text-base"}>
                          {Math.abs(finalAmount).toLocaleString()} VNĐ
                        </span>
                      </div>
                    </div>

                    {/* Hiển thị thông báo Thu thêm nếu refundAmount <= 0 */}
                    {finalAmount <= 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm flex items-start gap-3 text-red-800">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-950">Khách hàng còn nợ thêm</h4>
                          <p className="text-xs font-semibold mt-0.5">
                            Số tiền khách cần nộp bổ sung là {Math.abs(finalAmount).toLocaleString()} VNĐ. Vui lòng gửi yêu cầu
                            thanh toán thêm sau khi lưu bảng đối soát.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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

      {/* Details Modal */}
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
                      <span className="font-medium text-green-600">
                        +{selectedContract.baseRefundAmount.toLocaleString()} VNĐ
                      </span>
                    </div>

                    <div className="pl-4 py-2 my-2 border-l-2 border-gray-200 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Các khoản đã khấu trừ
                      </p>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hư hại tài sản phòng:</span>
                        <span className="font-medium text-red-600">-{selectedContract.damages.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nợ điện nước dịch vụ:</span>
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
