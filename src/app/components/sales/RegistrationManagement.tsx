import { useState } from "react";
import { Users, Calendar, Home, CheckCircle, XCircle, Eye } from "lucide-react";

export function RegistrationManagement() {
  const [selectedReg, setSelectedReg] = useState<number | null>(null);

  const registrations = [
    {
      id: 1,
      regId: "RR-2026-0514-001",
      applicant: "John Smith",
      room: "Room 201 - Building A",
      moveInDate: "June 1, 2026",
      duration: "12 months",
      status: "Pending Review",
      submittedDate: "May 14, 2026",
      phone: "+1 234-567-8900",
      email: "john.smith@email.com",
      additionalTenants: 0,
    },
    {
      id: 2,
      regId: "RR-2026-0513-003",
      applicant: "Sarah Johnson",
      room: "Room 305 - Building B",
      moveInDate: "May 25, 2026",
      duration: "6 months",
      status: "Approved",
      submittedDate: "May 13, 2026",
      phone: "+1 234-567-8901",
      email: "sarah.j@email.com",
      additionalTenants: 1,
    },
    {
      id: 3,
      regId: "RR-2026-0513-002",
      applicant: "Michael Chen",
      room: "Room 404 - Building A",
      moveInDate: "June 15, 2026",
      duration: "12 months",
      status: "Pending Review",
      submittedDate: "May 13, 2026",
      phone: "+1 234-567-8902",
      email: "m.chen@email.com",
      additionalTenants: 2,
    },
  ];

  const handleApprove = (id: number) => {
    alert(`Registration ${id} approved!`);
  };

  const handleReject = (id: number) => {
    alert(`Registration ${id} rejected!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Management</h1>
        <p className="text-gray-600">Review and manage rental applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total This Month</p>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>
      </div>

      {/* Registration List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {registrations.map((reg) => (
            <div key={reg.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{reg.applicant}</h3>
                      <p className="text-sm text-gray-600 mb-1">{reg.room}</p>
                      <p className="text-xs text-gray-500">ID: {reg.regId}</p>
                    </div>
                  </div>

                  <div className="ml-15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Move-in Date</p>
                      <p className="font-medium text-gray-900">{reg.moveInDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">{reg.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Additional Tenants</p>
                      <p className="font-medium text-gray-900">{reg.additionalTenants}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">{reg.submittedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                      reg.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {reg.status}
                  </span>

                  {reg.status === "Pending Review" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(reg.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(reg.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedReg(reg.id)}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
