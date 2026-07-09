import { useState } from "react";
import { UserCheck, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

export function TenantVerification() {
  const pendingVerifications = [
    {
      id: 1,
      name: "Sarah Johnson",
      room: "Room 305 - Building B",
      idNumber: "ID-2026-SJ-001",
      phone: "+1 234-567-8901",
      email: "sarah.j@email.com",
      submittedDate: "May 13, 2026",
      backgroundCheck: "Pending",
      creditCheck: "Completed",
      creditScore: 720,
      employmentStatus: "Employed",
      employer: "Tech Corp",
      monthlyIncome: 4500,
      previousRentals: 3,
    },
    {
      id: 2,
      name: "Michael Chen",
      room: "Room 404 - Building A",
      idNumber: "ID-2026-MC-002",
      phone: "+1 234-567-8902",
      email: "m.chen@email.com",
      submittedDate: "May 14, 2026",
      backgroundCheck: "Completed",
      creditCheck: "Completed",
      creditScore: 680,
      employmentStatus: "Self-Employed",
      employer: "Freelance Developer",
      monthlyIncome: 3800,
      previousRentals: 2,
    },
  ];

  const handleApprove = (id: number) => {
    alert(`Tenant ${id} approved!`);
  };

  const handleReject = (id: number) => {
    const reason = prompt("Reason for rejection:");
    if (reason) {
      alert(`Tenant ${id} rejected. Reason: ${reason}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Verification</h1>
        <p className="text-gray-600">Verify tenant eligibility and background</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Verification</p>
          <p className="text-2xl font-bold text-gray-900">{pendingVerifications.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Verified This Month</p>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="space-y-6">
        {pendingVerifications.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-600">{tenant.room}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  Pending Review
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">ID Number</p>
                      <p className="font-medium text-gray-900">{tenant.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{tenant.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{tenant.email}</p>
                    </div>
                  </div>
                </div>

                {/* Employment & Income */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Employment & Income</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">{tenant.employmentStatus}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Employer</p>
                      <p className="font-medium text-gray-900">{tenant.employer}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Income</p>
                      <p className="font-medium text-gray-900">${tenant.monthlyIncome}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Verification Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Background Check</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tenant.backgroundCheck === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {tenant.backgroundCheck}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Credit Check</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tenant.creditCheck === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {tenant.creditCheck}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Credit Score</p>
                      <p
                        className={`font-medium ${
                          tenant.creditScore >= 700 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {tenant.creditScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Previous Rentals</p>
                      <p className="font-medium text-gray-900">{tenant.previousRentals}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings/Notes */}
              {tenant.creditScore < 700 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900 mb-1">Credit Score Note</p>
                      <p className="text-sm text-orange-700">
                        Credit score is below 700. Consider requesting additional documentation or a
                        co-signer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(tenant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Tenant
                </button>

                <button
                  onClick={() => handleReject(tenant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors ml-auto">
                  <FileText className="w-4 h-4" />
                  View Documents
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
