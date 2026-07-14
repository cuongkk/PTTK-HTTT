import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Clock3 } from "lucide-react";
import { customerWorkflowService, type CustomerPayment } from "../../services/customerWorkflowService";

const statusLabel = (status: string) => status === "da_thanh_toan" ? "Đã xác nhận" : status === "cho_thanh_toan" ? "Chờ thanh toán" : status;

export function CustomerPayments() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    customerWorkflowService.getPayments().then(setPayments).catch(() => setError("Không thể tải danh sách thanh toán.")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
      {loading && <p className="text-sm text-gray-500">Đang tải...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="space-y-3">
        {payments.map((item) => {
          const expanded = expandedId === item.invoiceId;
          const Icon = item.status === "da_thanh_toan" ? CheckCircle2 : item.proofImageUrl ? Clock3 : AlertCircle;
          return (
            <article key={item.invoiceId} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button onClick={() => setExpandedId(expanded ? null : item.invoiceId)} className="grid w-full gap-2 px-5 py-4 text-left md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_auto] md:items-center">
                <span className="text-sm text-gray-500">{item.invoiceId}</span>
                <div><strong className="text-sm">{item.paymentType}</strong><p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p></div>
                <span className="text-sm">{item.roomName}</span>
                <strong className="text-sm">{item.amount.toLocaleString("vi-VN")} đ</strong>
                <span className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" />{statusLabel(item.status)}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="border-t bg-gray-50 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Ngân hàng:</span> <strong>{item.bankName}</strong></p>
                      <p><span className="text-gray-500">Số tài khoản:</span> <strong>{item.bankAccountNumber}</strong></p>
                      <p><span className="text-gray-500">Chủ tài khoản:</span> <strong>{item.bankAccountHolder}</strong></p>
                      <p><span className="text-gray-500">Nội dung:</span> <strong>{item.transferContent}</strong></p>
                    </div>
                    {item.status !== "da_thanh_toan" && (
                      <div>
                        <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-white text-sm text-gray-500">Mã QR thanh toán</div>
                        <label className="text-sm font-medium">Chứng từ chuyển khoản<input type="file" className="mt-2 block w-full text-sm" /></label>
                      </div>
                    )}
                  </div>
                  {item.status !== "da_thanh_toan" && <div className="mt-4 flex justify-end"><button className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">Tôi đã thanh toán</button></div>}
                  {item.paidAt && <p className="mt-3 text-xs text-gray-500">Đã xác nhận lúc {new Date(item.paidAt).toLocaleString("vi-VN")}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
