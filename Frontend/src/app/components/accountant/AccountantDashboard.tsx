import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  DollarSign,
  Clock,
  CheckCircle,
  RefreshCcw,
  TrendingUp,
  FileText,
  Calculator,
} from "lucide-react";
import { accountantService, Invoice } from "../../services/accountantService";

function GetInvoiceTypeName(type: string) {
  switch (type) {
    case "tien_coc":
      return "Tiền cọc phòng";
    case "tien_thue":
      return "Tiền thuê phòng";
    case "dich_vu":
      return "Phí dịch vụ";
    case "hoan_coc":
      return "Hoàn tiền cọc";
    case "thu_them":
      return "Thu thêm đối soát";
    default:
      return type;
  }
}

export function AccountantDashboard() {
  const [pendingPayments, setPendingPayments] = useState<Invoice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Chờ xác nhận thanh toán", value: "0 VNĐ", icon: Clock, color: "orange", count: "0" },
    { label: "Tổng nợ chưa thu", value: "0 VNĐ", icon: FileText, color: "blue", count: "0" },
    { label: "Yêu cầu hoàn tiền", value: "0 VNĐ", icon: RefreshCcw, color: "purple", count: "0" },
    { label: "Doanh thu", value: "0 VNĐ", icon: TrendingUp, color: "green", trend: undefined },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pending, allInvoices] = await Promise.all([
          accountantService.getPendingConfirmations(),
          accountantService.getSentRequests(),
        ]);

        setPendingPayments(pending.slice(0, 5));
        setRecentTransactions(allInvoices.filter(i => i.status === "da_thanh_toan").slice(0, 5));

        // Calculate stats
        const pendingAmount = pending.reduce((sum, p) => sum + p.totalAmount, 0);
        const unpaidInvoices = allInvoices.filter(i => i.status === "cho_thanh_toan" && i.documentType !== "chi" && i.invoiceType !== "hoan_coc");
        const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
        
        const refundInvoices = allInvoices.filter(i => i.invoiceType === "hoan_coc" || i.documentType === "chi");
        const refundAmount = refundInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

        const paidInvoices = allInvoices.filter(i => i.status === "da_thanh_toan");
        const monthlyRevenue = paidInvoices.reduce((sum, i) => {
          if (i.documentType === "chi" || i.invoiceType === "hoan_coc") {
            return sum - i.totalAmount;
          }
          return sum + i.totalAmount;
        }, 0);

        setStats([
          {
            label: "Chờ xác nhận thanh toán",
            value: `${pendingAmount.toLocaleString()} VNĐ`,
            icon: Clock,
            color: "orange",
            count: pending.length.toString(),
          },
          {
            label: "Tổng nợ chưa thu",
            value: `${unpaidAmount.toLocaleString()} VNĐ`,
            icon: FileText,
            color: "blue",
            count: unpaidInvoices.length.toString(),
          },
          {
            label: "Yêu cầu hoàn tiền",
            value: `${refundAmount.toLocaleString()} VNĐ`,
            icon: RefreshCcw,
            color: "purple",
            count: refundInvoices.length.toString(),
          },
          {
            label: "Doanh thu",
            value: `${monthlyRevenue.toLocaleString()} VNĐ`,
            icon: TrendingUp,
            color: "green",
            trend: paidInvoices.length > 0 ? `+${paidInvoices.filter(i => i.documentType !== "chi").length} gd` : undefined,
          },
        ]);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              <div key={payment.invoiceId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      <span className="font-mono mr-2">{payment.invoiceId}</span> — {payment.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">{GetInvoiceTypeName(payment.invoiceType)}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                    Chờ xác nhận
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{payment.totalAmount.toLocaleString()} VNĐ</span>
                  <span className="text-gray-600">Ngày lập: {new Date(payment.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            ))}
            {pendingPayments.length === 0 && (
              <div className="p-8 text-center text-gray-500">Không có khoản thanh toán nào chờ duyệt.</div>
            )}
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
              <div key={txn.invoiceId} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${txn.documentType === "thu" ? "bg-green-100" : "bg-red-100"
                      }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${txn.documentType === "thu" ? "text-green-600" : "text-red-600"
                        }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {txn.documentType === "thu" ? "Đã nhận thanh toán" : "Đã xử lý hoàn tiền"}
                      </h3>
                      <span
                        className={`font-bold ${txn.documentType === "thu" ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {txn.documentType === "thu" ? "+" : "-"}{txn.totalAmount.toLocaleString()} VNĐ
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-mono mr-2">{txn.invoiceId}</span> — {txn.customerName} ({txn.roomName})
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString("vi-VN")} lúc {new Date(txn.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">Chưa có giao dịch nào được ghi nhận.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

