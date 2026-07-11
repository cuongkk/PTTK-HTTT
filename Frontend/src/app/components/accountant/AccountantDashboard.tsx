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
    { label: "Chờ xác nhận thanh toán", value: "52.000.000 VNĐ", icon: Clock, color: "orange", count: "8" },
    { label: "Tổng nợ chưa thu", value: "34.000.000 VNĐ", icon: FileText, color: "blue", count: "5" },
    { label: "Yêu cầu hoàn tiền", value: "12.000.000 VNĐ", icon: RefreshCcw, color: "purple", count: "3" },
    { label: "Doanh thu tháng", value: "245.000.000 VNĐ", icon: TrendingUp, color: "green", trend: "+12%" },
  ];

  const pendingPayments = [
    {
      id: 1,
      customer: "Nguyễn Văn A",
      type: "Tiền phòng tháng",
      amount: 4000000,
      dueDate: "20 Thg 5, 2026",
      status: "Chờ xác nhận",
    },
    {
      id: 2,
      customer: "Trần Thị B",
      type: "Tiền cọc",
      amount: 8000000,
      dueDate: "25 Thg 5, 2026",
      status: "Chờ xác nhận",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      type: "Phí dịch vụ",
      amount: 500000,
      dueDate: "18 Thg 5, 2026",
      status: "Quá hạn",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "Đã nhận thanh toán",
      customer: "Phạm Thị D",
      amount: 4000000,
      date: "14 Thg 5, 2026",
      time: "10:30 SA",
    },
    {
      id: 2,
      type: "Đã xử lý hoàn tiền",
      customer: "Hoàng Văn E",
      amount: -6000000,
      date: "13 Thg 5, 2026",
      time: "15:45",
    },
    {
      id: 3,
      type: "Đã nhận thanh toán",
      customer: "Ngô Thị F",
      amount: 3000000,
      date: "13 Thg 5, 2026",
      time: "11:20 SA",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trang chủ</h1>
        <p className="text-gray-600">Chào mừng trở lại!</p>
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
          <h3 className="text-lg font-semibold mb-1">Yêu cầu thanh toán</h3>
          <p className="text-sm text-blue-100">Gửi yêu cầu thanh toán cho khách</p>
        </Link>

        <Link
          to="/accountant/check-in-charges"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all"
        >
          <Calculator className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Khoản thu nhận phòng</h3>
          <p className="text-sm text-indigo-100">Tính toán khoản thu lúc nhận phòng</p>
        </Link>

        <Link
          to="/accountant/payment-confirmation"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Xác nhận thanh toán</h3>
          <p className="text-sm text-green-100">Kiểm duyệt minh chứng thanh toán</p>
        </Link>

        <Link
          to="/accountant/reconciliation"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <RefreshCcw className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Đối soát trả phòng</h3>
          <p className="text-sm text-purple-100">Xử lý khấu trừ và hoàn tiền cọc</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Danh sách chờ xác nhận thanh toán</h2>
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
                    className={`px-3 py-1 text-xs font-medium rounded-full ${payment.status === "Overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                      }`}
                  >
                    {payment.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{payment.amount.toLocaleString()} VNĐ</span>
                  <span className="text-gray-600">Hạn chót: {payment.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/accountant/payment-confirmation"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xem tất cả danh sách chờ →
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Giao dịch gần đây</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${txn.amount > 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${txn.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{txn.type}</h3>
                      <span
                        className={`font-bold ${txn.amount > 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {txn.amount > 0 ? "+" : ""}{Math.abs(txn.amount).toLocaleString()} VNĐ
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{txn.customer}</p>
                    <p className="text-xs text-gray-500">
                      {txn.date} lúc {txn.time}
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
