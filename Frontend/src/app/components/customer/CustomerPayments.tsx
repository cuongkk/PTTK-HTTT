import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";

const payments = [
  { id: "TT001", type: "Tiền cọc", room: "PHONG_10", amount: "6.000.000 đ", date: "11/07/2026", status: "Đã xác nhận" },
  { id: "TT002", type: "Khoản nhận phòng", room: "PHONG_16", amount: "3.000.000 đ", date: "01/08/2026", status: "Chờ thanh toán" },
  { id: "TT003", type: "Khoản phát sinh", room: "PHONG_38", amount: "500.000 đ", date: "01/07/2026", status: "Chờ thanh toán" },
];

export function CustomerPayments() {
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1><p className="mt-1 text-gray-600">Theo dõi các khoản thu và trạng thái giao dịch.</p></div><div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="hidden grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-4 border-b bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 md:grid"><span>Mã</span><span>Khoản thu</span><span>Phòng</span><span>Số tiền</span><span>Trạng thái</span></div>{payments.map((item) => { const Icon = item.status === "Đã xác nhận" ? CheckCircle2 : item.status === "Đang đối chiếu" ? Clock3 : AlertCircle; return <div key={item.id} className="grid gap-2 border-b px-5 py-4 last:border-0 md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr] md:items-center"><span className="text-sm text-gray-500">{item.id}</span><div><strong className="text-sm">{item.type}</strong><p className="text-xs text-gray-500">{item.date}</p></div><span className="text-sm">{item.room}</span><strong className="text-sm">{item.amount}</strong><span className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" />{item.status}</span></div>; })}</div></div>;
}
