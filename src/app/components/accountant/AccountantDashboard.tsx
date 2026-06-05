import { Link } from "react-router";
import {
  DollarSign,
  Clock,
  CheckCircle,
  RefreshCcw,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  Calculator,
} from "lucide-react";

export function AccountantDashboard() {
  const stats = [
    { label: "Pending Payments", value: "$5,200", icon: Clock, color: "orange", count: "8" },
    { label: "Pending Invoices", value: "$3,400", icon: FileText, color: "blue", count: "5" },
    { label: "Refund Requests", value: "$1,200", icon: RefreshCcw, color: "purple", count: "3" },
    { label: "Monthly Revenue", value: "$24,500", icon: TrendingUp, color: "green", trend: "+12%" },
  ];

  const pendingPayments = [
    {
      id: 1,
      customer: "John Smith",
      type: "Monthly Rent",
      amount: 400,
      dueDate: "May 20, 2026",
      status: "Awaiting Confirmation",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      type: "Deposit",
      amount: 800,
      dueDate: "May 25, 2026",
      status: "Awaiting Confirmation",
    },
    {
      id: 3,
      customer: "Michael Chen",
      type: "Service Fee",
      amount: 50,
      dueDate: "May 18, 2026",
      status: "Overdue",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "Payment Received",
      customer: "Emma Wilson",
      amount: 400,
      date: "May 14, 2026",
      time: "10:30 AM",
    },
    {
      id: 2,
      type: "Refund Processed",
      customer: "David Lee",
      amount: -600,
      date: "May 13, 2026",
      time: "3:45 PM",
    },
    {
      id: 3,
      type: "Payment Received",
      customer: "Lisa Anderson",
      amount: 300,
      date: "May 13, 2026",
      time: "11:20 AM",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accountant Dashboard</h1>
        <p className="text-gray-600">Manage payments, invoices, and reconciliations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            orange: "bg-orange-100 text-orange-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            green: "bg-green-100 text-green-600",
          };
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.count && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-900 text-xs font-medium rounded-full">
                    {stat.count}
                  </span>
                )}
                {stat.trend && (
                  <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/accountant/payment-requests"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <DollarSign className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Payment Requests</h3>
          <p className="text-sm text-blue-100">Send payment requests to customers</p>
        </Link>

        <Link
          to="/accountant/check-in-charges"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all"
        >
          <Calculator className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Check-in Charges</h3>
          <p className="text-sm text-indigo-100">Calculate required check-in payments</p>
        </Link>

        <Link
          to="/accountant/payment-confirmation"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Payment Confirmation</h3>
          <p className="text-sm text-green-100">Verify and approve payment proofs</p>
        </Link>

        <Link
          to="/accountant/reconciliation"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <RefreshCcw className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Reconciliation</h3>
          <p className="text-sm text-purple-100">Process refunds and deductions</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Payment Confirmations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{payment.customer}</h3>
                    <p className="text-sm text-gray-600">{payment.type}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payment.status === "Overdue"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">${payment.amount}</span>
                  <span className="text-gray-600">Due: {payment.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/accountant/payment-confirmation"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all pending payments →
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      txn.amount > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${
                        txn.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{txn.type}</h3>
                      <span
                        className={`font-bold ${
                          txn.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{txn.customer}</p>
                    <p className="text-xs text-gray-500">
                      {txn.date} at {txn.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
