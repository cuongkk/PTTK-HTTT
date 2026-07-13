import { Link } from "react-router";
import {
  DollarSign,
  CheckCircle,
  RefreshCcw,
  Calculator,
} from "lucide-react";

export function AccountantDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/accountant/payment-requests"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all flex flex-col justify-between min-h-[140px]"
        >
          <DollarSign className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Yêu cầu thanh toán</h3>
        </Link>

        <Link
          to="/accountant/check-in-charges"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all flex flex-col justify-between min-h-[140px]"
        >
          <Calculator className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Khoản thu nhận phòng</h3>
        </Link>

        <Link
          to="/accountant/payment-confirmation"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all flex flex-col justify-between min-h-[140px]"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Xác nhận thanh toán</h3>
        </Link>

        <Link
          to="/accountant/reconciliation"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all flex flex-col justify-between min-h-[140px]"
        >
          <RefreshCcw className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold">Đối soát trả phòng</h3>
        </Link>
      </div>
    </div>
  );
}
