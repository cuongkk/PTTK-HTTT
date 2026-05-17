import { useState } from "react";
import { Calculator, DollarSign, AlertCircle, CheckCircle, FileText, Banknote, CreditCard, Send, Printer, Search } from "lucide-react";

export function Reconciliation() {
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [deductions, setDeductions] = useState({ damages: "", utilities: "", notes: "" });
  const [refundInfo, setRefundInfo] = useState({ method: "transfer", bankName: "", accountNumber: "", accountName: "" });

  const pendingReconciliations = [
    {
      id: 1,
      contractId: "RC-2026-0008",
      customer: "Emma Wilson",
      room: "Room 501 - Building C",
      moveInDate: "Jan 1, 2026",
      moveOutDate: "May 10, 2026",
      deposit: 1000,
      monthlyRent: 500,
      damages: 150,
      unpaidUtilities: 75,
      refundAmount: 775,
      status: "Pending Calculation",
    },
    {
      id: 2,
      contractId: "RC-2026-0003",
      customer: "David Lee",
      room: "Room 202 - Building A",
      moveInDate: "Dec 1, 2025",
      moveOutDate: "May 5, 2026",
      deposit: 800,
      monthlyRent: 400,
      damages: 0,
      unpaidUtilities: 0,
      refundAmount: 800,
      status: "Pending Approval",
    },
  ];

  const handleCalculateClick = (contract: any) => {
    setSelectedContract(contract);
    setDeductions({ damages: contract.damages.toString(), utilities: contract.unpaidUtilities.toString(), notes: "" });
    setShowCalcModal(true);
  };

  const handleConfirmCalculate = () => {
    alert(`Reconciliation for ${selectedContract.contractId} calculated successfully!`);
    setShowCalcModal(false);
    setSelectedContract(null);
  };

  const handleRefundClick = (contract: any) => {
    setSelectedContract(contract);
    setShowRefundModal(true);
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API processing delay
    setTimeout(() => {
      setIsProcessing(false);
      
      // Simulate random failure (10% chance) to demonstrate alternative flow A6
      const isFailure = Math.random() < 0.1; 
      
      if (isFailure && refundInfo.method === "transfer") {
        alert("Transaction failed! Bank network error or invalid account details. Please try again or choose another method.");
      } else {
        // Success
        setShowRefundModal(false);
        setShowVoucherModal(true);
      }
    }, 1500);
  };

  const handleConfirmVoucher = () => {
    alert(`Payment Voucher generated successfully! Refund process complete.`);
    setShowVoucherModal(false);
    setSelectedContract(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reconciliation</h1>
        <p className="text-gray-600">Calculate deductions and process refunds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Reconciliations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingReconciliations.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calculator className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">
                ${pendingReconciliations.reduce((sum, r) => sum + r.refundAmount, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Processed This Month</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reconciliations */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Reconciliation List</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, room or contract ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {pendingReconciliations
          .filter(
            (recon) =>
              recon.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
              recon.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
              recon.contractId.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((recon) => (
          <div
            key={recon.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {recon.contractId} - {recon.customer}
                  </h3>
                  <p className="text-sm text-gray-600">{recon.room}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    recon.status === "Pending Calculation"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {recon.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Move-in Date:</span>
                      <span className="font-medium text-gray-900">{recon.moveInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Move-out Date:</span>
                      <span className="font-medium text-gray-900">{recon.moveOutDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-medium text-gray-900">${recon.monthlyRent}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Reconciliation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="font-medium text-green-600">+${recon.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Damages:</span>
                      <span className="font-medium text-red-600">-${recon.damages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unpaid Utilities:</span>
                      <span className="font-medium text-red-600">-${recon.unpaidUtilities}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="font-semibold text-gray-900">Refund Amount:</span>
                      <span className="font-bold text-blue-600">${recon.refundAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {recon.damages > 0 && recon.status === "Pending Approval" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">Damages Noted</p>
                      <p className="text-sm text-red-700">
                        Room inspection found damages totaling ${recon.damages}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {recon.status === "Pending Calculation" && (
                  <button
                    onClick={() => handleCalculateClick(recon)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    Input Deductions
                  </button>
                )}

                {recon.status === "Pending Approval" && (
                  <>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                      <FileText className="w-4 h-4" />
                      View Report
                    </button>
                    <button
                      onClick={() => handleRefundClick(recon)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Process Refund
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calculator className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Input Deductions</h2>
                <p className="text-sm text-gray-600">
                  {selectedContract.contractId} - {selectedContract.customer}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Damages ($)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Unpaid Utilities ($)</label>
                <input
                  type="number"
                  min="0"
                  value={deductions.utilities}
                  onChange={(e) => setDeductions({ ...deductions, utilities: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Initial Deposit:</span>
                  <span className="font-medium text-gray-900">${selectedContract.deposit}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Final Refund Amount:</span>
                  <span className={selectedContract.deposit - (Number(deductions.damages) + Number(deductions.utilities)) < 0 ? "text-red-600" : "text-blue-600"}>
                    ${selectedContract.deposit - (Number(deductions.damages) + Number(deductions.utilities))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCalcModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCalculate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Process Refund</h2>
            <p className="text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
              Refund amount: <span className="font-bold text-green-600">${selectedContract.refundAmount}</span> for {selectedContract.customer}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refund Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "transfer" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      refundInfo.method === "transfer" 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundInfo({ ...refundInfo, method: "cash" })}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      refundInfo.method === "cash" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-medium">Cash</span>
                  </button>
                </div>
              </div>

              {refundInfo.method === "transfer" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.bankName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Chase Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountNumber}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                    <input
                      type="text"
                      required
                      value={refundInfo.accountName}
                      onChange={(e) => setRefundInfo({ ...refundInfo, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter account name"
                    />
                  </div>
                </div>
              )}

              {refundInfo.method === "cash" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm mt-4">
                  Please ensure the customer is present to receive the cash refund and sign the receipt document.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isProcessing ? "Processing..." : (refundInfo.method === "transfer" ? "Transfer Money" : "Process Cash")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Voucher Modal (Phiếu chi) */}
      {showVoucherModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment Voucher</h2>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 mb-6 bg-gray-50">
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Voucher Number</p>
                <p className="font-mono font-bold text-gray-900">VCHR-{new Date().getFullYear()}-{selectedContract.id.toString().padStart(4, '0')}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium text-gray-900">{selectedContract.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract ID:</span>
                  <span className="font-medium text-gray-900">{selectedContract.contractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium text-gray-900 uppercase">{refundInfo.method}</span>
                </div>
                
                {refundInfo.method === "transfer" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium text-gray-900">{refundInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-medium text-gray-900">{refundInfo.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-gray-900">TXN-{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                  </>
                )}
                
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Refunded:</span>
                  <span className="text-xl font-bold text-blue-600">${selectedContract.refundAmount}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 text-center">
              Please review the voucher details before confirming. A copy will be sent to the customer automatically.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoucher}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Printer className="w-4 h-4" />
                Confirm & Generate Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
