import { useState } from "react";
import { CheckCircle, XCircle, Eye, Image, FileText, DollarSign, Printer, Search } from "lucide-react";

export function PaymentConfirmation() {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);

  const pendingPayments = [
    {
      id: 1,
      customer: "Nguyễn Văn A",
      room: "Phòng 203 - Tòa A",
      type: "Tiền phòng tháng",
      amount: 4000000,
      dueDate: "20 Thg 5, 2026",
      submittedDate: "15 Thg 5, 2026",
      paymentMethod: "Chuyển khoản",
      transactionId: "TXN-2026-05-15-0001",
      hasProof: true,
      bankName: "Ngân hàng ACB",
      accountNumber: "1234567890",
      accountName: "NGUYEN VAN A",
    },
    {
      id: 2,
      customer: "Trần Thị B",
      room: "Phòng 305 - Tòa B",
      type: "Tiền cọc",
      amount: 8000000,
      dueDate: "25 Thg 5, 2026",
      submittedDate: "14 Thg 5, 2026",
      paymentMethod: "Chuyển khoản",
      transactionId: "TXN-2026-05-14-0003",
      hasProof: true,
      bankName: "Ngân hàng VCB",
      accountNumber: "0987654321",
      accountName: "TRAN THI B",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      room: "Phòng 404 - Tòa A",
      type: "Phí dịch vụ",
      amount: 500000,
      dueDate: "18 Thg 5, 2026",
      submittedDate: "16 Thg 5, 2026",
      paymentMethod: "Tiền mặt",
      transactionId: null,
      hasProof: false,
    },
  ];

  const handleApproveClick = (payment: any) => {
    setReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const handleConfirmReceipt = () => {
    alert(`Thanh toán ${receiptPayment.id} đã được duyệt và biên lai đã được tạo!`);
    setShowReceiptModal(false);
    setReceiptPayment(null);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Lý do từ chối:");
    if (reason) {
      alert(`Thanh toán ${id} đã bị từ chối. Lý do: ${reason}`);
    }
  };

  const handleViewProof = (id: number) => {
    setSelectedPayment(id);
    setShowProofModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác nhận thanh toán</h1>
        <p className="text-gray-600">Kiểm tra và phê duyệt minh chứng thanh toán của khách</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
          <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Tổng số tiền</p>
          <p className="text-2xl font-bold text-gray-900">
            {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} VNĐ
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Đã xác nhận hôm nay</p>
          <p className="text-2xl font-bold text-gray-900">4</p>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách chờ xác nhận</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, phòng hoặc mã giao dịch..."
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
                p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{payment.customer}</h3>
                      <p className="text-sm text-gray-600">{payment.room}</p>
                    </div>
                  </div>

                  <div className="ml-15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Loại</p>
                      <p className="font-medium text-gray-900">{payment.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Số tiền</p>
                      <p className="font-medium text-gray-900">{payment.amount.toLocaleString()} VNĐ</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phương thức</p>
                      <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày nộp</p>
                      <p className="font-medium text-gray-900">{payment.submittedDate}</p>
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
                  {payment.hasProof && (
                    <button
                      onClick={() => handleViewProof(payment.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors w-full lg:w-auto"
                    >
                      <Image className="w-4 h-4" />
                      Xem minh chứng
                    </button>
                  )}

                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleApproveClick(payment)}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Proof Modal */}
      {showProofModal && selectedPayment !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Minh chứng thanh toán</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Chi tiết giao dịch</h3>
                {(() => {
                  const payment = pendingPayments.find(p => p.id === selectedPayment);
                  return payment ? (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500">Phương thức thanh toán</span>
                        <span className="font-medium text-gray-900">{payment.paymentMethod}</span>
                      </div>
                      {payment.transactionId && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Mã giao dịch</span>
                          <span className="font-mono text-gray-900 bg-gray-200 py-1 px-2 rounded w-fit">{payment.transactionId}</span>
                        </div>
                      )}
                      {(payment as any).bankName && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Tên ngân hàng</span>
                          <span className="font-medium text-gray-900">{(payment as any).bankName}</span>
                        </div>
                      )}
                      {(payment as any).accountNumber && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Số tài khoản</span>
                          <span className="font-mono text-gray-900">{(payment as any).accountNumber}</span>
                        </div>
                      )}
                      {(payment as any).accountName && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Tên người gửi</span>
                          <span className="font-medium text-gray-900 uppercase">{(payment as any).accountName}</span>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 min-h-[300px]">
                <div className="text-center p-6">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Ảnh biên lai thanh toán</p>
                  <p className="text-sm text-gray-500">Khách hàng tải lên</p>
                </div>
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
                <p className="text-sm text-gray-500 mb-1">Số biên lai</p>
                <p className="font-mono font-bold text-gray-900">RCPT-{new Date().getFullYear()}-{receiptPayment.id.toString().padStart(4, '0')}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phòng:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại thanh toán:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.paymentMethod}</span>
                </div>
                {receiptPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono text-gray-900">{receiptPayment.transactionId}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng số tiền đã nhận:</span>
                  <span className="text-xl font-bold text-green-600">{receiptPayment.amount.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 text-center">
              Vui lòng kiểm tra thông tin trước khi xác nhận. Một bản sao sẽ được gửi tự động cho khách hàng.
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Xác nhận & Tạo biên lai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
