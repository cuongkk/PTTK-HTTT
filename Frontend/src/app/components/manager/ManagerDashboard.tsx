import { Link } from "react-router";
import {
  Building2,
  Users,
  FileCheck,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function ManagerDashboard() {
  const stats = [
    { label: "Tỷ lệ lấp đầy", value: "85%", icon: Building2, color: "blue", trend: "+5%" },
    { label: "Doanh thu tháng này", value: "$24,500", icon: DollarSign, color: "green", trend: "+12%" },
    { label: "Yêu cầu chờ duyệt", value: "6", icon: AlertCircle, color: "orange" },
    { label: "Hợp đồng hiệu lực", value: "42", icon: FileCheck, color: "purple" },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: "Thanh toán tiền cọc",
      customer: "Sarah Johnson",
      room: "Phòng 305 - Tòa B",
      amount: "$800",
      date: "13/05/2026",
    },
    {
      id: 2,
      type: "Hợp đồng thuê phòng",
      customer: "Michael Chen",
      room: "Phòng 404 - Tòa A",
      amount: "$250/tháng",
      date: "14/05/2026",
    },
    {
      id: 3,
      type: "Xác minh khách thuê",
      customer: "Emma Wilson",
      room: "Phòng 501 - Tòa C",
      amount: "-",
      date: "14/05/2026",
    },
  ];

  const roomStats = [
    { building: "Tòa A", total: 20, occupied: 18, available: 2, maintenance: 0 },
    { building: "Tòa B", total: 15, occupied: 12, available: 2, maintenance: 1 },
    { building: "Tòa C", total: 10, occupied: 8, available: 1, maintenance: 1 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Xác nhận thuê phòng",
      details: "Hợp đồng thuê của John Smith - Phòng 203",
      time: "2 giờ trước",
    },
    {
      id: 2,
      action: "Kiểm tra tình trạng phòng",
      details: "Phòng 501 đạt kiểm tra - Sẵn sàng đón khách mới",
      time: "4 giờ trước",
    },
    {
      id: 3,
      action: "Kiểm tra điều kiện lưu trú khách hàng",
      details: "Đã hoàn thành xác minh lý lịch cho Sarah Johnson",
      time: "1 ngày trước",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trang chủ</h1>
        <p className="text-gray-600">Tổng quan hệ thống và quản lý phê duyệt</p>
      </div>

      {/* Stats */}
      
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            orange: "bg-orange-100 text-orange-600",
            purple: "bg-purple-100 text-purple-600",
          };
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.trend && (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.trend}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div> */}

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/manager/inspection-status"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Kiểm tra tình trạng phòng</h3>
          <p className="text-sm text-blue-100">Xác nhận tình trạng phòng</p>
        </Link>

        <Link
          to="/manager/inspection-conditions"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Kiểm tra trạng thái phòng</h3>
          <p className="text-sm text-blue-100">Xác nhận trạng thái phòng</p>
        </Link>


        <Link
          to="/manager/deposit-confirmation"
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 hover:from-cyan-600 hover:to-cyan-700 transition-all"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Xác nhận đặt cọc</h3>
          <p className="text-sm text-cyan-100">
            Kiểm tra thông tin đặt cọc
          </p>
        </Link>

        <Link
          to="/manager/contract-approval"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-green-700 transition-all"
        >
          <FileCheck className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Xác nhận thuê phòng</h3>
          <p className="text-sm text-green-100">Duyệt hợp đồng mới</p>
        </Link>

        <Link
          to="/manager/tenant-verification"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-purple-700 transition-all"
        >
          <Users className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Ký hợp đồng thuê</h3>
          <p className="text-sm text-purple-100">Xác minh hồ sơ khách</p>
        </Link>

        <Link
          to="/manager/liquidation"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <ClipboardCheck className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Thanh lý hợp đồng thuê</h3>
          <p className="text-sm text-orange-100">Chấm dứt thuê & đối chiếu</p>
        </Link>
      </div> */}


      {/* Recent Activity */}
      {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{activity.action}</h3>
                <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}