import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Image, FileText, DollarSign, Printer, Search } from "lucide-react";
import { accountantService, Invoice } from "../../services/accountantService";

function GetInvoiceTypeName(type: string) {
  switch (type) {
    case "tien_coc":
      return "Tiền cọc phòng";
    case "tien_thue":
      return "Tiền thuê phòng tháng";
    case "dich_vu":
      return "Phí dịch vụ sinh hoạt";
    case "hoan_coc":
      return "Hoàn tiền cọc";
    case "thu_them":
      return "Thu thêm đối soát";
    default:
      return type;
  }
}

export function PaymentConfirmation() {
  const [selectedPayment, setSelectedPayment] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Invoice | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Invoice[]>([]);
  const [confirmedTodayCount, setConfirmedTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  async function loadConfirmations() {
    try {
      const [list, allInvoices] = await Promise.all([
        accountantService.getPendingConfirmations(),
        accountantService.getSentRequests(),
      ]);
      setPendingPayments(list);
      
      const todayStr = new Date().toDateString();
      const todayConfirmed = allInvoices.filter(i => 
        i.status === "da_thanh_toan" && 
        i.paidAt && 
        new Date(i.paidAt).toDateString() === todayStr
      );
      setConfirmedTodayCount(todayConfirmed.length);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chờ xác nhận:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfirmations();
  }, []);

  const handleApproveClick = (payment: Invoice) => {
    setReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const handleConfirmReceipt = async () => {
    if (!receiptPayment) return;
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt thanh toán cho hóa đơn ${receiptPayment.invoiceId} không?`)) return;
    setActioning(true);
    try {
      await accountantService.approvePayment(receiptPayment.invoiceId);
      alert(`Thanh toán cho hóa đơn ${receiptPayment.invoiceId} đã được phê duyệt thành công!`);
      setShowReceiptModal(false);
      setReceiptPayment(null);
      loadConfirmations();
    } catch (err) {
      console.error("Lỗi khi duyệt thanh toán:", err);
      alert("Đã xảy ra lỗi khi duyệt thanh toán.");
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async (invoiceId: string) => {
    const reason = prompt("Lý do từ chối thanh toán:");
    if (!reason) return;
    
    if (!window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI thanh toán hóa đơn ${invoiceId} với lý do: "${reason}" không?`)) return;
    
    setActioning(true);
    try {
      await accountantService.rejectPayment(invoiceId, reason);
      alert(`Đã từ chối thanh toán hóa đơn ${invoiceId}.`);
      loadConfirmations();
    } catch (err) {
      console.error("Lỗi khi từ chối thanh toán:", err);
      alert("Đã xảy ra lỗi khi từ chối thanh toán.");
    } finally {
      setActioning(false);
    }
  };

  const handleViewProof = (payment: Invoice) => {
    setSelectedPayment(payment);
    setShowProofModal(true);
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
        <h1 className="text-3xl font-bold text-gray-900">Xác nhận thanh toán</h1>
      </div>


      {/* Pending Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách chờ xác nhận</h2>
          <div className="relative w-full sm:w-64">
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
        <div className="divide-y divide-gray-200">
          {pendingPayments
            .filter(
              (p) =>
                p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.roomName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((payment) => (
              <div key={payment.invoiceId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          <span className="font-mono mr-2">{payment.invoiceId}</span> — {payment.customerName}
                        </h3>
                        <p className="text-sm text-gray-600">{payment.roomName}</p>
                      </div>
                    </div>

                    <div className="ml-15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Loại khoản thu</p>
                        <p className="font-medium text-gray-900">{GetInvoiceTypeName(payment.invoiceType)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Số tiền</p>
                        <p className="font-medium text-gray-900">{payment.totalAmount.toLocaleString()} VNĐ</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phương thức</p>
                        <p className="font-medium text-gray-900">
                          {payment.paymentMethod === "chuyen_khoan" ? "Chuyển khoản" : "Tiền mặt"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ngày lập</p>
                        <p className="font-medium text-gray-900">{new Date(payment.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>

                    {payment.transactionId && (
                      <div className="ml-15 p-3 bg-gray-50 rounded-lg text-sm inline-block">
                        <span className="text-gray-600 mr-2">Mã giao dịch:</span>
                        <span className="font-mono text-gray-900 font-medium">{payment.transactionId}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    {payment.proofImage && (
                      <button
                        onClick={() => handleViewProof(payment)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors w-full lg:w-auto"
                      >
                        <Image className="w-4 h-4 text-blue-500" />
                        Xem minh chứng
                      </button>
                    )}

                    <div className="flex gap-2 w-full lg:w-auto">
                      <button
                        onClick={() => handleApproveClick(payment)}
                        disabled={actioning}
                        className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(payment.invoiceId)}
                        disabled={actioning}
                        className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {pendingPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">Không có khoản thanh toán nào cần xác nhận.</div>
          )}
        </div>
      </div>

      {/* View Proof Modal */}
      {showProofModal && selectedPayment !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Minh chứng thanh toán</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Chi tiết giao dịch</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Phương thức thanh toán</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedPayment.paymentMethod === "chuyen_khoan" ? "Chuyển khoản ngân hàng" : "Tiền mặt"}
                    </span>
                  </div>
                  {selectedPayment.transactionId && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">Mã giao dịch</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedPayment.transactionId}</span>
                    </div>
                  )}
                  {selectedPayment.bankName && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">Tên ngân hàng</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedPayment.bankName}</span>
                    </div>
                  )}
                  {selectedPayment.accountNumber && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">Số tài khoản chuyển khoản</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedPayment.accountNumber}</span>
                    </div>
                  )}
                  {selectedPayment.accountName && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500">Tên chủ tài khoản</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedPayment.accountName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 min-h-[300px]">
                {selectedPayment.proofImage ? (
                  <img
                    src={selectedPayment.proofImage}
                    alt="Minh chứng thanh toán"
                    className="max-w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Không tìm thấy ảnh minh chứng</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Generation Modal */}
      {showReceiptModal && receiptPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Biên lai thu tiền</h2>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Mã biên lai</p>
                <p className="font-mono font-bold text-gray-900">RCPT-{new Date().getFullYear()}-{receiptPayment.invoiceId}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phòng:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại thanh toán:</span>
                  <span className="font-medium text-gray-900">{GetInvoiceTypeName(receiptPayment.invoiceType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-gray-900">
                    {receiptPayment.paymentMethod === "chuyen_khoan" ? "Chuyển khoản" : "Tiền mặt"}
                  </span>
                </div>
                {receiptPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono text-gray-900">{receiptPayment.transactionId}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng số tiền đã nhận:</span>
                  <span className="text-xl font-bold text-green-600">{receiptPayment.totalAmount.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 text-center">
              Vui lòng kiểm tra kỹ thông tin. Một thông báo xác nhận thành công sẽ được gửi trực tiếp cho khách hàng.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReceipt}
                disabled={actioning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                {actioning ? "Đang xử lý..." : "Xác nhận & Tạo biên lai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
