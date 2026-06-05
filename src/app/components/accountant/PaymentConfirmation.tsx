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
      customer: "John Smith",
      room: "Room 203 - Building A",
      type: "Monthly Rent",
      amount: 400,
      dueDate: "May 20, 2026",
      submittedDate: "May 15, 2026",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN-2026-05-15-0001",
      hasProof: true,
      bankName: "Chase Bank",
      accountNumber: "1234567890",
      accountName: "John Smith",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      type: "Deposit",
      amount: 800,
      dueDate: "May 25, 2026",
      submittedDate: "May 14, 2026",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN-2026-05-14-0003",
      hasProof: true,
      bankName: "Bank of America",
      accountNumber: "0987654321",
      accountName: "Sarah M Johnson",
    },
    {
      id: 3,
      customer: "Michael Chen",
      room: "Room 404 - Building A",
      type: "Service Fee",
      amount: 50,
      dueDate: "May 18, 2026",
      submittedDate: "May 16, 2026",
      paymentMethod: "Cash",
      transactionId: null,
      hasProof: false,
    },
  ];

  const handleApproveClick = (payment: any) => {
    setReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const handleConfirmReceipt = () => {
    alert(`Payment ${receiptPayment.id} approved and receipt generated!`);
    setShowReceiptModal(false);
    setReceiptPayment(null);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Reason for rejection:");
    if (reason) {
      alert(`Payment ${id} rejected. Reason: ${reason}`);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmation</h1>
        <p className="text-gray-600">Verify and approve customer payment proofs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Confirmation</p>
          <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            ${pendingPayments.reduce((sum, p) => sum + p.amount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Confirmed Today</p>
          <p className="text-2xl font-bold text-gray-900">4</p>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Pending Confirmations</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, room or TXN ID..."
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
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium text-gray-900">{payment.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">${payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{payment.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">{payment.submittedDate}</p>
                    </div>
                  </div>

                  {payment.transactionId && (
                    <div className="ml-15 p-3 bg-gray-50 rounded-lg text-sm inline-block">
                      <span className="text-gray-600 mr-2">Transaction ID:</span>
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
                      View Proof
                    </button>
                  )}

                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleApproveClick(payment)}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      className="flex-1 lg:flex-none flex justify-center items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Proof</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Transaction Details</h3>
                {(() => {
                  const payment = pendingPayments.find(p => p.id === selectedPayment);
                  return payment ? (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium text-gray-900">{payment.paymentMethod}</span>
                      </div>
                      {payment.transactionId && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Transaction ID</span>
                          <span className="font-mono text-gray-900 bg-gray-200 py-1 px-2 rounded w-fit">{payment.transactionId}</span>
                        </div>
                      )}
                      {(payment as any).bankName && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Bank Name</span>
                          <span className="font-medium text-gray-900">{(payment as any).bankName}</span>
                        </div>
                      )}
                      {(payment as any).accountNumber && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Account Number</span>
                          <span className="font-mono text-gray-900">{(payment as any).accountNumber}</span>
                        </div>
                      )}
                      {(payment as any).accountName && (
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500">Account Name</span>
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
                  <p className="text-gray-600 font-medium">Payment receipt image</p>
                  <p className="text-sm text-gray-500">Uploaded by customer</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
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
              <h2 className="text-2xl font-bold text-gray-900">Payment Receipt</h2>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Receipt Number</p>
                <p className="font-mono font-bold text-gray-900">RCPT-{new Date().getFullYear()}-{receiptPayment.id.toString().padStart(4, '0')}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium text-gray-900">{receiptPayment.paymentMethod}</span>
                </div>
                {receiptPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-gray-900">{receiptPayment.transactionId}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount Received:</span>
                  <span className="text-xl font-bold text-green-600">${receiptPayment.amount}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 text-center">
              Please review the receipt details before confirming. A copy will be sent to the customer automatically.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReceipt}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Confirm & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
