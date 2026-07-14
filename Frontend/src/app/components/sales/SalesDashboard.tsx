import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Building2, Users, FileText, Calendar, TrendingUp, Clock, AlertCircle, Bell, X } from "lucide-react";
import { salesApi, SalesDashboardData } from "../../services/sales/salesApi";
import { notificationService, type AppNotification } from "../../services/notificationService";

export function SalesDashboard() {
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedApt, setSelectedApt] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      salesApi.getDashboard(),
      notificationService.getMine()
    ])
      .then(([dashboardRes, notifRes]) => {
        setData(dashboardRes);
        setNotifications(notifRes.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể kết nối API máy chủ.");
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: "Phòng/giường trống", value: data?.vacantRoomsCount.toString() ?? "0", icon: Building2, color: "blue", trend: "0" },
    { label: "Đăng ký mới hôm nay", value: data?.newApplicationsTodayCount.toString() ?? "0", icon: Users, color: "green", trend: "0" },
    { label: "HĐ cọc chờ thanh toán", value: data?.pendingDepositsCount.toString() ?? "0", icon: FileText, color: "orange", trend: "0" },
    { label: "Lịch hẹn hôm nay", value: data?.todayAppointmentsCount.toString() ?? "0", icon: Calendar, color: "purple", trend: "0" },
  ];

  const recentRegistrations = data?.recentRegistrations.map((r) => ({
    id: r.applicationId,
    name: r.customerName,
    room: `${r.desiredArea} · ${r.desiredRoomType === "ghep" ? "Ở ghép" : "Nguyên căn"} · ${r.minPrice?.toLocaleString("vi-VN") ?? "0"} - ${r.maxPrice?.toLocaleString("vi-VN") ?? "0"} đ`,
    date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
    status: r.status === "moi" ? "Chờ sắp lịch" : r.status === "da_xem_phong" ? "Đã xem" : r.status === "cho_sale_ra_soat_coc" ? "Chờ Sale rà soát cọc" : r.status,
    statusColor: r.status === "moi" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700",
  })) ?? [];

  const upcomingAppointments = data?.upcomingAppointments.map((apt) => ({
    id: apt.scheduleId,
    client: apt.customerName,
    room: apt.roomName === "Chưa rõ" ? "Chưa chọn phòng" : apt.roomName,
    branchName: apt.branchName,
    date: new Date(apt.appointmentAt).toLocaleDateString("vi-VN"),
    time: new Date(apt.appointmentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    type: apt.type,
  })) ?? [];

  const pendingTasks = data?.pendingTasks ?? [];

  const getNotificationLink = (n: AppNotification) => {
    const content = n.content;
    const title = n.title.toLowerCase();
    if (title.includes("nhận phòng") || content.toLowerCase().includes("nhận phòng")) {
      const depositMatch = content.match(/DC[a-zA-Z0-9]+/);
      if (depositMatch) {
        return `/sales/contracts?action=checkin&ref=${depositMatch[0]}`;
      }
      return "/sales/contracts";
    }
    if (title.includes("trả phòng") || content.toLowerCase().includes("trả phòng")) {
      const contractMatch = content.match(/HD[a-zA-Z0-9]+/);
      if (contractMatch) {
        return `/sales/checkout-contract?contractId=${contractMatch[0]}`;
      }
      return "/sales/checkout-contract";
    }
    if (title.includes("cọc") || content.toLowerCase().includes("cọc")) {
      return "/sales/contracts";
    }
    if (title.includes("đăng ký") || content.toLowerCase().includes("đăng ký")) {
      return "/sales/registrations";
    }
    return "/sales/notifications";
  };

  const getNotificationStyle = (n: AppNotification) => {
    const title = n.title.toLowerCase();
    const content = n.content.toLowerCase();
    if (title.includes("nhận phòng") || content.includes("nhận phòng")) {
      return {
        label: "Yêu cầu nhận phòng",
        badgeClass: "text-blue-700 bg-blue-100",
        borderClass: "border-blue-100",
        btnColor: "bg-blue-600 hover:bg-blue-700",
        btnLabel: "Đối chiếu & Nhận phòng →"
      };
    }
    if (title.includes("trả phòng") || content.includes("trả phòng")) {
      return {
        label: "Yêu cầu trả phòng",
        badgeClass: "text-orange-700 bg-orange-100",
        borderClass: "border-orange-100",
        btnColor: "bg-orange-600 hover:bg-orange-700",
        btnLabel: "Tiếp nhận trả phòng →"
      };
    }
    if (title.includes("đăng ký") || content.includes("đăng ký")) {
      return {
        label: "Đăng ký mới",
        badgeClass: "text-green-700 bg-green-100",
        borderClass: "border-green-100",
        btnColor: "bg-green-600 hover:bg-green-700",
        btnLabel: "Xử lý đăng ký →"
      };
    }
    return {
      label: "Thông báo hệ thống",
      badgeClass: "text-purple-700 bg-purple-100",
      borderClass: "border-purple-100",
      btnColor: "bg-purple-600 hover:bg-purple-700",
      btnLabel: "Xem chi tiết →"
    };
  };

  const displayNotifs = notifications.slice(0, 2);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-500 text-sm">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="font-bold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

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
        {displayNotifs.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 bg-white rounded-xl border border-blue-100">
            Hiện tại không có thông báo yêu cầu mới nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayNotifs.map((n) => {
              const style = getNotificationStyle(n);
              const link = getNotificationLink(n);
              return (
                <div key={n.notificationId} className={`bg-white rounded-lg p-4 border ${style.borderClass} flex flex-col justify-between gap-3 shadow-xs`}>
                  <div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style.badgeClass}`}>{style.label}</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</p>
                    <p className="text-sm text-gray-700 mt-2 font-medium">
                      {n.content}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <span className="text-xs text-gray-500">Mã TB: {n.notificationId}</span>
                    <Link to={link} className={`px-3 py-1.5 ${style.btnColor} text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1`}>
                      {style.btnLabel}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            {recentRegistrations.map((reg) => (
              <div key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{reg.name}</p>
                    <p className="text-xs text-gray-500">{reg.room}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${reg.statusColor}`}>{reg.status}</span>
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
              <h2 className="font-bold text-gray-900 text-sm">Lịch hẹn sắp tới</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} onClick={() => setSelectedApt(apt)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
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
              {upcomingAppointments.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">Không có lịch hẹn nào.</div>
              )}
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
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${t.urgent ? "text-red-500" : "text-gray-400"}`} />
                  <span className={t.urgent ? "text-red-700" : "text-gray-600"}>{t.text}</span>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">Mọi công việc đã được xử lý xong!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-150 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Chi tiết lịch hẹn
              </h2>
              <button onClick={() => setSelectedApt(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs text-gray-700">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Mã lịch hẹn</span>
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-900 font-semibold">{selectedApt.id}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Khách hàng</span>
                <span className="font-semibold text-gray-900">{selectedApt.client}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Ngày hẹn</span>
                <span className="font-semibold text-gray-900">{selectedApt.date}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Giờ hẹn</span>
                <span className="font-semibold text-blue-600">{selectedApt.time}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Phòng xem</span>
                <span className="font-semibold text-gray-900">{selectedApt.room}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Chi nhánh</span>
                <span className="font-semibold text-gray-900">{selectedApt.branchName || "Chi nhánh Quận 5"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Loại công việc</span>
                <span className="font-semibold text-gray-900">{selectedApt.type}</span>
              </div>
            </div>
            <div className="px-5 pb-5 text-right">
              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
