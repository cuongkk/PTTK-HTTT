import { useState } from "react";
import {
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  AlertCircle,
  DollarSign,
  Calendar,
} from "lucide-react";

export function CustomerPayments() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  const payments = [
    {
      id: 1,
      type: "Monthly Rent",
      room: "Room 203 - Building A",
      amount: 400,
      dueDate: "May 20, 2026",
      status: "Paid",
      paidDate: "May 15, 2026",
      receiptId: "RCP-2026-0001",
    },
    {
      id: 2,
      type: "Deposit",
      room: "Room 301 - Building B",
      amount: 800,
      dueDate: "May 25, 2026",
      status: "Pending Confirmation",
      paidDate: null,
      receiptId: null,
    },
    {
      id: 3,
      type: "Monthly Rent",
      room: "Room 203 - Building A",
      amount: 400,
      dueDate: "June 20, 2026",
      status: "Unpaid",
      paidDate: null,
      receiptId: null,
    },
    {
      id: 4,
      type: "Service Fee",
      room: "Room 203 - Building A",
      amount: 50,
      dueDate: "May 20, 2026",
      status: "Paid",
      paidDate: "May 15, 2026",
      receiptId: "RCP-2026-0002",
    },
  ];

  const statusConfig = {
    Paid: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    "Pending Confirmation": {
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    Unpaid: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    Failed: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  };

  const handleUploadProof = (paymentId: number) => {
    setSelectedPayment(paymentId);
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedPayment(null);
  };

  const handleSubmitProof = () => {
    // Handle proof upload
    alert("Payment proof uploaded successfully!");
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
        <p className="text-gray-600">View and manage your payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">$850</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">$800</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">$400</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {payments.map((payment) => {
            const config = statusConfig[payment.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;

            return (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <CreditCard className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{payment.type}</h3>
                        <p className="text-sm text-gray-600">{payment.room}</p>
                      </div>
                    </div>

                    <div className="ml-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium text-gray-900">${payment.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Due Date</p>
                        <p className="font-medium text-gray-900">{payment.dueDate}</p>
                      </div>
                      {payment.paidDate && (
                        <div>
                          <p className="text-gray-600">Paid Date</p>
                          <p className="font-medium text-gray-900">{payment.paidDate}</p>
                        </div>
                      )}
                      {payment.receiptId && (
                        <div>
                          <p className="text-gray-600">Receipt ID</p>
                          <p className="font-medium text-gray-900">{payment.receiptId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-14 md:ml-0">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-sm font-medium ${config.color}`}>
                        {payment.status}
                      </span>
                    </div>

                    {payment.status === "Unpaid" && (
                      <button
                        onClick={() => handleUploadProof(payment.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Proof
                      </button>
                    )}

                    {payment.status === "Paid" && (
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Payment Proof</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>Bank Transfer</option>
                <option>Credit Card</option>
                <option>Cash</option>
                <option>E-Wallet</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt/Proof
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter transaction ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProof}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
