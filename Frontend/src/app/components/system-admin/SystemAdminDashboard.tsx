import { Link } from "react-router";
import {
  Shield,
  Users,
  Settings,
  Building2,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function SystemAdminDashboard() {
  const stats = [
    {
      label: "Tổng số tài khoản",
      value: "248",
      note: "+18 trong tháng này",
      icon: Users,
      color: "blue",
    },
    {
      label: "Chính sách hoạt động",
      value: "12",
      note: "4 cập nhật gần đây nhất",
      icon: Settings,
      color: "purple",
    },
    {
      label: "Danh mục phòng/giường",
      value: "36",
      note: "Phòng đơn, phòng chung, phòng cao cấp, v.v.",
      icon: Building2,
      color: "green",
    },
    {
      label: "Danh sách dịch vụ",
      value: "9",
      note: "Điện, nước, wifi, dọn dẹp, v.v.",
      icon: DollarSign,
      color: "orange",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Tạo, chỉnh sửa và phân quyền cho tài khoản nhân viên và khách hàng.",
      path: "/system-admin/users",
      icon: Users,
      tone: "from-blue-500 to-blue-600",
      caption: "Accounts and permissions",
    },
    {
      title: "Cài đặt hệ thống",
      description: "Cấu hình các quy tắc chung như tỷ lệ cọc và thời hạn thanh toán.",
      path: "/system-admin/settings",
      icon: Settings,
      tone: "from-purple-500 to-purple-600",
      caption: "Global configuration",
    },
    {
      title: "Danh mục phòng/giường",
      description: "Duy trì các danh mục phòng, sức chứa giường và giá thuê.",
      path: "/system-admin/rooms",
      icon: Building2,
      tone: "from-emerald-500 to-emerald-600",
      caption: "Rooms, beds, and pricing",
    },
    {
      title: "Danh mục dịch vụ",
      description: "Quản lý các dịch vụ tiện ích và bổ sung như điện, nước và wifi.",
      path: "/system-admin/services",
      icon: DollarSign,
      tone: "from-orange-500 to-orange-600",
      caption: "Fees and add-ons",
    },
  ];

  const alerts = [
    {
      title: "Xem lại tỷ lệ hoàn trả cọc",
      detail: "Chỉnh sửa gần đây đã thay đổi tỷ lệ hoàn trả cọc từ 80% xuống 70%.",
      status: "Needs attention",
    },
    {
      title: "Phân công vai trò nhân viên",
      detail: "3 tài khoản nhân viên mới đã được tạo và cần được phân công vai trò phù hợp.",
      status: "Pending",
    },
    {
      title: "Cập nhật giá dịch vụ",
      detail: "Điện đã được cập nhật từ 3,000 VND/kWh lên 3,500 VND/kWh vào tuần trước.",
      status: "Updated",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/15">
              Console quản trị hệ thống
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Trung tâm quản trị</h1>
              <p className="mt-3 text-slate-200 max-w-2xl">
                Quản lý tài khoản, chính sách, danh mục phòng và dịch vụ tiện ích của hệ thống cho thuê nhà trọ.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link to="/system-admin/users">
                  Xem lại người dùng
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/system-admin/settings">
                  Mở cài đặt hệ thống
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Tình trạng hệ thống</p>
              <p className="mt-1 text-2xl font-semibold">99.9%</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Thay đổi đang mở</p>
              <p className="mt-1 text-2xl font-semibold">7</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Hành động đã kiểm toán</p>
              <p className="mt-1 text-2xl font-semibold">128</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-slate-300">Cập nhật chính sách</p>
              <p className="mt-1 text-2xl font-semibold">4</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            green: "bg-emerald-100 text-emerald-700",
            orange: "bg-orange-100 text-orange-700",
          };

          return (
            <Card key={stat.label} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className={`rounded-2xl p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.path} to={action.path} className="group">
              <Card className="h-full overflow-hidden border-slate-200/80 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <CardContent className="p-0">
                  <div className={`flex h-full flex-col justify-between bg-gradient-to-br ${action.tone} p-6 text-white`}>
                    <div>
                      <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
                        {action.caption}
                      </Badge>
                      <h3 className="mt-4 text-xl font-semibold">{action.title}</h3>
                      <p className="mt-2 max-w-md text-sm text-white/85">{action.description}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/90">
                      <span>Mở module</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Hàng đợi vận hành</CardTitle>
            <CardDescription>Các mục ưu tiên cao cần xem xét của quản trị viên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                  <Badge variant={item.status === "Needs attention" ? "destructive" : "outline"}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Bản chụp chính sách</CardTitle>
            <CardDescription>Các cài đặt chia sẻ hiện đang được sử dụng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Tỷ lệ hoàn cọc", value: "70%" },
              { label: "Thời gian miễn phí thanh toán", value: "24h" },
              { label: "SLA phê duyệt tài khoản", value: "2 ngày" },
              { label: "Đánh giá giá dịch vụ", value: "Hàng tháng" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
