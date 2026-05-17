import { useState } from "react";
import { Send, User, Home, DollarSign, Calendar, CheckCircle, Search } from "lucide-react";

export function PaymentRequests() {
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    paymentType: "deposit",
    amount: "",
    dueDate: "",
    notes: "",
  });

  const pendingContracts = [
    { id: 1, name: "John Smith", room: "Room 203 - Building A", contractId: "CT-2026-0601" },
    { id: 2, name: "Emily Davis", room: "Room 102 - Building C", contractId: "CT-2026-0604" },
    { id: 3, name: "James Wilson", room: "Room 501 - Building A", contractId: "CT-2026-0605" },
  ];

  const sentRequests = [
    {
      id: 1,
      customer: "Sarah Johnson",
      room: "Room 305 - Building B",
      type: "Deposit",
      amount: 800,
      dueDate: "May 25, 2026",
      sentDate: "May 13, 2026",
      status: "Pending",
    },
    {
      id: 2,
      customer: "Michael Chen",
      room: "Room 404 - Building A",
      type: "Monthly Rent",
      amount: 250,
      dueDate: "June 1, 2026",
      sentDate: "May 14, 2026",
      status: "Pending",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Payment request sent successfully!");
    setSelectedContract(null);
    setFormData({
      paymentType: "deposit",
      amount: "",
      dueDate: "",
      notes: "",
    });
  };

  const handleSelectContract = (id: number) => {
    setSelectedContract(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests</h1>
          <p className="text-gray-600">Send payment requests to customers</p>
        </div>
      </div>

      {/* Create Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Contracts List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pending Contracts</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, room or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-3">
            {pendingContracts
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractId.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contract) => (
              <div
                key={contract.id}
                onClick={() => handleSelectContract(contract.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedContract === contract.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-blue-600">{contract.contractId}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-900 font-medium mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  {contract.name}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Home className="w-4 h-4 text-gray-500" />
                  {contract.room}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {selectedContract ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create Payment Request</h2>
                  <p className="text-sm text-gray-600">
                    For {pendingContracts.find((c) => c.id === selectedContract)?.name}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      required
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="rent">Monthly Rent</option>
                      <option value="service">Service Fee</option>
                      <option value="utilities">Utilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed text-gray-500 p-8">
              <Send className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-1">No Contract Selected</p>
              <p className="text-center max-w-sm">
                Select a pending contract from the list to create a payment request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Sent Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sentRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{request.customer}</h3>
                      <p className="text-sm text-gray-600">{request.room}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm ml-0 lg:ml-15 mt-2 lg:mt-0">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium text-gray-900">{request.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">${request.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-medium text-gray-900">{request.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sent Date</p>
                      <p className="font-medium text-gray-900">{request.sentDate}</p>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full self-start lg:self-auto">
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
