import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, ChevronRight, KeyRound, Loader2, Settings, Shield, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ApiError } from "../../services/apiClient";
import { systemAdminService, type AdminDashboard } from "../../services/system-admin/systemAdminService";

export function SystemAdminDashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  useEffect(() => {
    systemAdminService.getDashboard().then(setData).catch((error) =>
      toast.error(error instanceof ApiError ? error.message : "Không thể tải số liệu quản trị."));
  }, []);

  if (!data) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>;

  const stats = [
    { label: "Tài khoản", value: data.totalAccounts, note: `${data.activeAccounts} đang hoạt động`, icon: Users, color: "bg-blue-50 text-blue-700" },
    { label: "Vai trò và quyền", value: data.totalRoles, note: `${data.totalPermissions} quyền nghiệp vụ`, icon: KeyRound, color: "bg-violet-50 text-violet-700" },
    { label: "Phòng/giường", value: data.totalRooms, note: `${data.emptyRooms} phòng trống · ${data.emptyBeds}/${data.totalBeds} giường trống`, icon: Building2, color: "bg-emerald-50 text-emerald-700" },
    { label: "Dịch vụ", value: data.totalServices, note: `${data.activeServices} đang áp dụng`, icon: Sparkles, color: "bg-amber-50 text-amber-700" },
  ];
  const modules = [
    { title: "Quản lý người dùng", description: "Tài khoản, hồ sơ, vai trò và trạng thái sử dụng.", path: "/system-admin/users", icon: Users },
    { title: "Phân quyền", description: "Thiết lập các quyền nghiệp vụ cho từng vai trò.", path: "/system-admin/access", icon: KeyRound },
    { title: "Thông số hệ thống", description: `${data.totalSystemParameters} thông số đặt cọc và hoàn cọc đang áp dụng.`, path: "/system-admin/settings", icon: Settings },
    { title: "Phòng/giường", description: `${data.emptyRooms} phòng còn trống, ${data.rentedRooms} phòng đang thuê.`, path: "/system-admin/rooms", icon: Building2 },
    { title: "Dịch vụ", description: "Danh mục dịch vụ và đơn giá mặc định.", path: "/system-admin/services", icon: Sparkles },
    { title: "Danh mục vận hành", description: `${data.activeResidenceRules} nội quy hiệu lực; quản lý tiện nghi, ảnh và giá áp dụng.`, path: "/system-admin/catalogs", icon: Shield },
  ];

  return <div className="space-y-8">
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl">
      <Badge className="bg-white/10 text-white">Quản trị hệ thống</Badge>
      <h1 className="mt-4 text-4xl font-bold">Tổng quan dữ liệu vận hành</h1>
      <p className="mt-3 max-w-2xl text-slate-300">Số liệu được tổng hợp trực tiếp từ cơ sở dữ liệu tại thời điểm mở màn hình.</p>
    </section>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, note, icon: Icon, color }) => <Card key={label}>
        <CardContent className="pt-6"><div className={`w-fit rounded-2xl p-3 ${color}`}><Icon className="h-6 w-6" /></div>
          <p className="mt-4 text-sm text-slate-500">{label}</p><p className="text-3xl font-bold text-slate-900">{value}</p><p className="mt-2 text-sm text-slate-600">{note}</p>
        </CardContent>
      </Card>)}
    </section>
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {modules.map(({ title, description, path, icon: Icon }) => <Link to={path} key={path}>
        <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg"><CardHeader className="flex-row items-start justify-between">
          <div><div className="mb-4 w-fit rounded-xl bg-slate-100 p-3"><Icon className="h-5 w-5" /></div><CardTitle>{title}</CardTitle><p className="mt-2 text-sm text-slate-600">{description}</p></div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </CardHeader></Card>
      </Link>)}
    </section>
  </div>;
}
