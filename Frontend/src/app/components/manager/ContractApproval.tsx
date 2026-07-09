import { useState } from "react";
import { FileCheck, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";

export function ContractApproval() {
  const pendingContracts = [
    {
      id: 1,
      contractId: "DC-2026-0002",
      type: "Deposit Contract",
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      amount: 600,
      depositAmount: 600,
      startDate: "May 20, 2026",
      duration: "6 months",
      createdBy: "Sales Staff - Alice",
      submittedDate: "May 13, 2026",
      status: "Pending Review",
    },
    {
      id: 2,
      contractId: "RC-2026-0014",
      type: "Rental Contract",
      customer: "Michael Chen",
      room: "Room 404 - Building A",
      amount: 250,
      depositAmount: 500,
      startDate: "June 1, 2026",
      endDate: "June 1, 2027",
      duration: "12 months",
      createdBy: "Sales Staff - Bob",
      submittedDate: "May 14, 2026",
      status: "Pending Review",
    },
  ];

  const [selectedContract, setSelectedContract] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    alert(`Contract ${id} approved!`);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Reason for rejection:");
    if (reason) {
      alert(`Contract ${id} rejected. Reason: ${reason}`);
    }
  };

  const handleRequestRevision = (id: number) => {
    const revision = prompt("Requested revisions:");
    if (revision) {
      alert(`Revision requested for contract ${id}: ${revision}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Approval</h1>
        <p className="text-gray-600">Review and approve rental contracts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-gray-900">{pendingContracts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Approved This Month</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Rejected/Revised</p>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
      </div>

      {/* Pending Contracts */}
      <div className="space-y-6">
        {pendingContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{contract.contractId}</h3>
                  <p className="text-sm text-gray-600">{contract.type}</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {contract.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">{contract.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium text-gray-900">{contract.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Amount:</span>
                      <span className="font-medium text-gray-900">${contract.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit:</span>
                      <span className="font-medium text-gray-900">${contract.depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">{contract.duration}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Submission Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium text-gray-900">{contract.startDate}</span>
                    </div>
                    {contract.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium text-gray-900">{contract.endDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium text-gray-900">{contract.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium text-gray-900">{contract.submittedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Contract
                </button>

                <button
                  onClick={() => handleRequestRevision(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Revision
                </button>

                <button
                  onClick={() => handleReject(contract.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors ml-auto">
                  <Eye className="w-4 h-4" />
                  View Full Contract
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
