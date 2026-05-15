import { useState } from "react";
import { CheckCircle, XCircle, Eye, Image, FileText, DollarSign } from "lucide-react";

export function PaymentConfirmation() {
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);

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
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      type: "Deposit",
      amount: 800,
      dueDate: "May 25, 2026",
      submittedDate: "May 14, 2026",
      paymentMethod: "Credit Card",
      transactionId: "TXN-2026-05-14-0003",
      hasProof: true,
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

  const handleApprove = (id: number) => {
    alert(`Payment ${id} approved!`);
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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Pending Confirmations</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingPayments.map((payment) => (
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
                    <div className="ml-15 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="text-gray-600">Transaction ID</p>
                      <p className="font-mono text-gray-900">{payment.transactionId}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:items-end">
                  {payment.hasProof && (
                    <button
                      onClick={() => handleViewProof(payment.id)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      View Proof
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(payment.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(payment.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
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
      {showProofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Proof</h2>

            {/* Proof Image Placeholder */}
            <div className="mb-6 border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Payment receipt image</p>
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
    </div>
  );
}
