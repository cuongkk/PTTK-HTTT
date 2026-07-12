import { Link } from "react-router";
import { BedDouble, CreditCard, Search, Bell } from "lucide-react";

export function CustomerDashboard() {
  const actions = [
    { title: "Tìm phòng/giường", description: "Xem chỗ ở còn phù hợp", path: "/customer/rooms", icon: Search },
    { title: "Phòng/giường của tôi", description: "Đã xem, đã cọc và đang thuê", path: "/customer/my-rooms", icon: BedDouble },
    { title: "Thanh toán", description: "Xem lịch sử các khoản thu", path: "/customer/payments", icon: CreditCard },
    { title: "Thông báo", description: "Xem thông tin mới từ hệ thống", path: "/customer/notifications", icon: Bell },
  ];
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">Tổng quan khách hàng</h1><p className="mt-1 text-gray-600">Chọn chức năng cần thực hiện.</p></div><div className="grid gap-4 md:grid-cols-2">{actions.map(({ title, description, path, icon: Icon }) => <Link key={path} to={path} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300"><div className="flex items-center gap-4"><div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Icon className="h-6 w-6" /></div><div><h2 className="font-bold text-gray-900">{title}</h2><p className="mt-1 text-sm text-gray-600">{description}</p></div></div></Link>)}</div></div>;
}
