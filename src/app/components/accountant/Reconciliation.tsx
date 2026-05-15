import { useState } from "react";
import { Calculator, DollarSign, AlertCircle, CheckCircle, FileText } from "lucide-react";

export function Reconciliation() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);

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

  const handleCalculate = (id: number) => {
    alert(`Reconciliation calculated for contract ${id}`);
  };

  const handleProcessRefund = (id: number) => {
    alert(`Refund processed for contract ${id}`);
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
        {pendingReconciliations.map((recon) => (
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

              {recon.damages > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">Damages Noted</p>
                      <p className="text-sm text-red-700">
                        Room inspection found damages totaling ${recon.damages}. Please review the
                        inspection report.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {recon.status === "Pending Calculation" && (
                  <button
                    onClick={() => handleCalculate(recon.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calculator className="w-4 h-4" />
                    Calculate Reconciliation
                  </button>
                )}

                {recon.status === "Pending Approval" && (
                  <>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                      <FileText className="w-4 h-4" />
                      View Report
                    </button>
                    <button
                      onClick={() => handleProcessRefund(recon.id)}
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
    </div>
  );
}
