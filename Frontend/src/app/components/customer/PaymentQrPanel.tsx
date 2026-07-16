import { CheckCircle2 } from "lucide-react";

interface PaymentQrPanelProps {
  amount: number;
  transferContent: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  confirmed?: boolean;
  onConfirm: () => void;
}

export function PaymentQrPanel({
  amount,
  transferContent,
  bankName = "Vietcombank",
  accountNumber = "0123456789",
  accountHolder = "HOMESTAY DORM",
  confirmed = false,
  onConfirm,
}: PaymentQrPanelProps) {
  const resolvedAccountNumber = accountNumber || "0123456789";
  const resolvedAccountHolder = accountHolder || "HOMESTAY DORM";
  const qrUrl = `https://img.vietqr.io/image/VCB-${encodeURIComponent(resolvedAccountNumber)}-compact2.png?amount=${Math.max(0, Math.round(amount))}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(resolvedAccountHolder)}`;

  if (confirmed) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-800">
        <CheckCircle2 className="mx-auto h-12 w-12" />
        <h3 className="mt-3 text-xl font-bold">Thanh toán thành công</h3>
        <p className="mt-1 text-sm">Giao dịch đã được xác nhận trên hệ thống.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <img src={qrUrl} alt={`Mã QR thanh toán ${transferContent}`} className="mx-auto aspect-square w-full object-contain" />
          <p className="mt-2 text-center text-xs text-gray-500">Mở ứng dụng ngân hàng và quét mã QR</p>
        </div>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white px-4">
          <PaymentInfo label="Ngân hàng" value={bankName || "Vietcombank"} />
          <PaymentInfo label="Số tài khoản" value={resolvedAccountNumber} />
          <PaymentInfo label="Chủ tài khoản" value={resolvedAccountHolder} />
          <PaymentInfo label="Số tiền" value={`${amount.toLocaleString("vi-VN")} đ`} />
          <PaymentInfo label="Nội dung" value={transferContent} />
        </div>
      </div>
      <button type="button" onClick={onConfirm} className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
        Xác nhận thanh toán thành công
      </button>
    </div>
  );
}

function PaymentInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <strong className="text-right text-gray-900">{value}</strong>
    </div>
  );
}
