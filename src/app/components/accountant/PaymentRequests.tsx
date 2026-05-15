import { useState } from "react";
import { Send, User, Home, DollarSign, Calendar, CheckCircle } from "lucide-react";

export function PaymentRequests() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    room: "",
    paymentType: "deposit",
    amount: "",
    dueDate: "",
    notes: "",
  });

  const customers = [
    { id: "1", name: "John Smith", room: "Room 203 - Building A" },
    { id: "2", name: "Sarah Johnson", room: "Room 305 - Building B" },
    { id: "3", name: "Michael Chen", room: "Room 404 - Building A" },
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
    setShowCreateForm(false);
    setFormData({
      customer: "",
      room: "",
      paymentType: "deposit",
      amount: "",
      dueDate: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Requests</h1>
          <p className="text-gray-600">Send payment requests to customers</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Send className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create Payment Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  required
                  value={formData.customer}
                  onChange={(e) => {
                    const customer = customers.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      customer: e.target.value,
                      room: customer?.room || "",
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
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

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sent Requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

                  <div className="ml-15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
