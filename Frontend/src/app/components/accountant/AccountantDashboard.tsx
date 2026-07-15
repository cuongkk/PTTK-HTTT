import { Link } from "react-router";
import {
  DollarSign,
  CheckCircle,
  RefreshCcw,
  Calculator,
  ClipboardList,
} from "lucide-react";

export function AccountantDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link
          to="/accountant/payment-requests"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all flex flex-col min-h-[140px] shadow-sm hover:shadow-md"
        >
          <DollarSign className="w-8 h-8" />
          <h3 className="text-lg font-semibold mt-4 h-14">Yêu cầu thanh toán cọc</h3>
        </Link>

        <Link
          to="/accountant/check-in-charges"
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-indigo-700 transition-all flex flex-col min-h-[140px] shadow-sm hover:shadow-md"
        >
          <ClipboardList className="w-8 h-8" />
          <h3 className="text-lg font-semibold mt-4 h-14">Khoản thu nhận phòng</h3>
        </Link>

        <Link
          to="/accountant/payment-confirmation"
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 hover:from-emerald-600 hover:to-emerald-700 transition-all flex flex-col min-h-[140px] shadow-sm hover:shadow-md"
        >
          <CheckCircle className="w-8 h-8" />
          <h3 className="text-lg font-semibold mt-4 h-14">Xác nhận thanh toán</h3>
        </Link>

        <Link
          to="/accountant/create-reconciliation"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all flex flex-col min-h-[140px] shadow-sm hover:shadow-md"
        >
          <Calculator className="w-8 h-8" />
          <h3 className="text-lg font-semibold mt-4 h-14">Lập đối soát</h3>
        </Link>

        <Link
          to="/accountant/perform-refund"
          className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl p-6 hover:from-rose-600 hover:to-rose-700 transition-all flex flex-col min-h-[140px] shadow-sm hover:shadow-md"
        >
          <RefreshCcw className="w-8 h-8" />
          <h3 className="text-lg font-semibold mt-4 h-14">Hoàn cọc</h3>
        </Link>
      </div>
    </div>
  );
}
