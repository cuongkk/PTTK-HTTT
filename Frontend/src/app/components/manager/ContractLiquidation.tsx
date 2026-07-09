import { useState } from "react";
import { ClipboardCheck, Calendar, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

export function ContractLiquidation() {
  const contractsToLiquidate = [
    {
      id: 1,
      contractId: "RC-2026-0008",
      customer: "Emma Wilson",
      room: "Room 501 - Building C",
      startDate: "Jan 1, 2026",
      endDate: "May 31, 2026",
      moveOutDate: "May 10, 2026",
      earlyTermination: true,
      monthlyRent: 500,
      deposit: 1000,
      status: "Pending Liquidation",
      inspectionCompleted: true,
      reconciliationCompleted: false,
    },
    {
      id: 2,
      contractId: "RC-2026-0003",
      customer: "David Lee",
      room: "Room 202 - Building A",
      startDate: "Dec 1, 2025",
      endDate: "May 31, 2026",
      moveOutDate: "May 5, 2026",
      earlyTermination: false,
      monthlyRent: 400,
      deposit: 800,
      status: "Pending Liquidation",
      inspectionCompleted: true,
      reconciliationCompleted: true,
    },
  ];

  const handleLiquidate = (id: number) => {
    alert(`Contract ${id} liquidated successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Liquidation</h1>
        <p className="text-gray-600">End rental contracts and start reconciliation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Liquidation</p>
          <p className="text-2xl font-bold text-gray-900">{contractsToLiquidate.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Liquidated This Month</p>
          <p className="text-2xl font-bold text-gray-900">5</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Inspection</p>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Contracts to Liquidate */}
      <div className="space-y-6">
        {contractsToLiquidate.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {contract.contractId} - {contract.customer}
                  </h3>
                  <p className="text-sm text-gray-600">{contract.room}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {contract.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Contract Period */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contract Period</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium text-gray-900">{contract.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium text-gray-900">{contract.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Move-out Date:</span>
                      <span className="font-medium text-gray-900">{contract.moveOutDate}</span>
                    </div>
                    {contract.earlyTermination && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Early Termination</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-medium text-gray-900">${contract.monthlyRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit:</span>
                      <span className="font-medium text-gray-900">${contract.deposit}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Liquidation Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {contract.inspectionCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`text-sm ${
                        contract.inspectionCompleted ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Room Inspection Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.reconciliationCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`text-sm ${
                        contract.reconciliationCompleted ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      Reconciliation Completed
                    </span>
                  </div>
                </div>
              </div>

              {!contract.reconciliationCompleted && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Action Required</p>
                      <p className="text-sm text-blue-700">
                        Please complete reconciliation in the Accountant section before liquidating
                        this contract.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  disabled={!contract.inspectionCompleted || !contract.reconciliationCompleted}
                  onClick={() => handleLiquidate(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Complete Liquidation
                </button>

                {!contract.inspectionCompleted && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    Go to Inspection
                  </button>
                )}

                {!contract.reconciliationCompleted && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                    Go to Reconciliation
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
