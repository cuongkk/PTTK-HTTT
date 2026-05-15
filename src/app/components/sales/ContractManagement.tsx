import { useState } from "react";
import { FileText, Search, Calendar, User, Building2, Plus, Eye, Printer } from "lucide-react";

export function ContractManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const contracts = [
    {
      id: 1,
      contractId: "DC-2026-0001",
      type: "Deposit Contract",
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      amount: 600,
      startDate: "May 20, 2026",
      status: "Active",
      createdDate: "May 13, 2026",
    },
    {
      id: 2,
      contractId: "RC-2026-0012",
      type: "Rental Contract",
      customer: "John Smith",
      room: "Room 203 - Building A",
      amount: 400,
      startDate: "Jan 15, 2026",
      endDate: "Jan 15, 2027",
      status: "Active",
      createdDate: "Jan 10, 2026",
    },
    {
      id: 3,
      contractId: "DC-2026-0002",
      type: "Deposit Contract",
      customer: "Michael Chen",
      room: "Room 404 - Building A",
      amount: 500,
      startDate: "June 1, 2026",
      status: "Pending",
      createdDate: "May 14, 2026",
    },
  ];

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || contract.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Management</h1>
          <p className="text-gray-600">Create and manage rental contracts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by contract ID, customer, or room..."
              className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="Deposit Contract">Deposit Contract</option>
            <option value="Rental Contract">Rental Contract</option>
          </select>
        </div>
      </div>

      {/* Contract List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        contract.type === "Deposit Contract"
                          ? "bg-purple-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <FileText
                        className={`w-6 h-6 ${
                          contract.type === "Deposit Contract"
                            ? "text-purple-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{contract.contractId}</h3>
                      <p className="text-sm text-gray-600">{contract.type}</p>
                    </div>
                  </div>

                  <div className="ml-15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Customer</p>
                      <p className="font-medium text-gray-900">{contract.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Room</p>
                      <p className="font-medium text-gray-900">{contract.room}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">${contract.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">{contract.startDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                      contract.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {contract.status}
                  </span>

                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
