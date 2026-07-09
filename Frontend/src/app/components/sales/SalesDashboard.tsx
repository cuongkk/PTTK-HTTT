import { Link } from "react-router";
import { Building2, Users, FileText, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, Bell, FilePlus, FileCheck, DoorOpen } from "lucide-react";

export function SalesDashboard() {
  const stats = [
    { label: "Phòng/giường trống", value: "8",  icon: Building2, color: "blue",   trend: "+2" },
    { label: "Đăng ký mới hôm nay", value: "5", icon: Users,     color: "green",  trend: "+3" },
    { label: "HĐ cọc chờ thanh toán", value: "3", icon: FileText, color: "orange", trend: "+1" },
    { label: "Lịch hẹn hôm nay",    value: "4",  icon: Calendar,  color: "purple", trend: "0"  },
  ];

  const recentRegistrations = [
    { id: 1, name: "Nguyễn Văn B", room: "Khu A – 1 người – 1.5-2 triệu", date: "14/05/2026", status: "Đã gửi lịch hẹn",   statusColor: "bg-green-100 text-green-700" },
    { id: 2, name: "Trần Thị C",   room: "Khu B – 2 người – Trên 2 triệu", date: "13/05/2026", status: "Chờ xác nhận lịch", statusColor: "bg-orange-100 text-orange-700" },
    { id: 3, name: "Lê Văn D",     room: "Khu A – 1 người – Dưới 1.5 triệu", date: "13/05/2026", status: "Chờ xác nhận lịch", statusColor: "bg-orange-100 text-orange-700" },
  ];

  const upcomingAppointments = [
    { id: 1, client: "Nguyễn Văn B", room: "Phòng 201 – Tòa A", time: "09:00",  type: "Xem phòng" },
    { id: 2, client: "Phạm Thị E",   room: "Phòng 305 – Tòa B", time: "14:00",  type: "Xem phòng" },
    { id: 3, client: "Hoàng Văn F",  room: "Phòng 102 – Tòa C", time: "16:00",  type: "Ký hợp đồng thuê" },
  ];

  const pendingTasks = [
    { text: "2 hợp đồng cọc chờ thanh toán quá 12 giờ", urgent: true },
    { text: "1 yêu cầu trả phòng đang chờ xử lý",        urgent: false },
    { text: "3 đăng ký chưa được gửi lịch hẹn",          urgent: false },
  ];

  const colorMap: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-600",
    green:  "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bảng điều khiển – Nhân viên Sale</h1>
        <p className="text-gray-500 text-sm">Quản lý đăng ký thuê phòng và hợp đồng</p>
      </div>

      {/* Notifications Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-blue-800 font-bold">
          <Bell className="w-5 h-5 animate-bounce" />
          <h2>Thông báo yêu cầu mới từ hệ thống</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Yêu cầu nhận phòng</span>
              <p className="text-xs text-gray-400 mt-1">Đến hẹn nhận phòng</p>
              <p className="text-sm text-gray-700 mt-2 font-medium">
                Khách hàng <span className="font-bold text-gray-900">Nguyễn Văn B</span> (Mã ĐK: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">DK-2026-0514-001</span>) yêu cầu nhận phòng cho <span className="font-bold text-gray-900">Phòng 201 – Tòa A</span>.
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-500">Mã cọc: HDC-2026-001</span>
              <Link to="/sales/contracts?action=checkin&ref=HDC-2026-001" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                Đối chiếu & Nhận phòng →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-orange-100 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <span className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">Yêu cầu trả phòng</span>
              <p className="text-xs text-gray-400 mt-1">Hết hạn hợp đồng hoặc trả trước hạn</p>
              <p className="text-sm text-gray-700 mt-2 font-medium">
                Khách hàng <span className="font-bold text-gray-900">Nguyễn Văn A</span> gửi yêu cầu trả phòng cho <span className="font-bold text-gray-900">Phòng 102 – Tòa C</span>.
              </p>
            </div>
             <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-xs text-gray-500">Mã HĐ: HDT-2026-001</span>
              <Link to="/sales/checkout-contract?contractId=HDT-2026-001" className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                Tiếp nhận trả phòng →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colorMap[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.trend !== "0" && (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />{stat.trend}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Đăng ký gần đây</h2>
            <Link to="/sales/registrations" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRegistrations.map(reg => (
              <div key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{reg.name}</p>
                    <p className="text-xs text-gray-500">{reg.room}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${reg.statusColor}`}>{reg.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{reg.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Today's appointments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm">Lịch hẹn hôm nay</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-xs">{apt.client}</p>
                        <span className="text-xs font-medium text-blue-600">{apt.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">{apt.room}</p>
                      <p className="text-xs text-gray-400">{apt.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending tasks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm">Cần xử lý</h2>
            </div>
            <div className="p-4 space-y-2">
              {pendingTasks.map((t, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${t.urgent ? "bg-red-50" : "bg-gray-50"}`}>
                  {t.urgent
                    ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    : <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                  <span className={t.urgent ? "text-red-700" : "text-gray-600"}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
