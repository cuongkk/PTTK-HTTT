import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Clock3 } from "lucide-react";
import { customerWorkflowService, type CustomerPayment } from "../../services/customerWorkflowService";
import { PaymentQrPanel } from "./PaymentQrPanel";

const statusLabel = (status: string) => status === "da_thanh_toan" ? "Đã xác nhận" : status === "cho_thanh_toan" ? "Chờ thanh toán" : status;

export function CustomerPayments() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

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
          const confirmed = item.status === "da_thanh_toan" || confirmedIds.includes(item.invoiceId);
          const Icon = confirmed ? CheckCircle2 : item.proofImageUrl ? Clock3 : AlertCircle;
          return (
            <article key={item.invoiceId} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button onClick={() => setExpandedId(expanded ? null : item.invoiceId)} className="grid w-full gap-2 px-5 py-4 text-left md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_auto] md:items-center">
                <span className="text-sm text-gray-500">{item.invoiceId}</span>
                <div><strong className="text-sm">{item.paymentType}</strong><p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p></div>
                <span className="text-sm">{item.roomName}</span>
                <strong className="text-sm">{item.amount.toLocaleString("vi-VN")} đ</strong>
                <span className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4" />{confirmed ? "Đã xác nhận" : statusLabel(item.status)}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="border-t bg-gray-50 p-5">
                  <PaymentQrPanel
                    amount={item.amount}
                    transferContent={item.transferContent}
                    bankName={item.bankName}
                    accountNumber={item.bankAccountNumber}
                    accountHolder={item.bankAccountHolder}
                    confirmed={confirmed}
                    onConfirm={() => setConfirmedIds((current) => current.includes(item.invoiceId) ? current : [...current, item.invoiceId])}
                  />
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
