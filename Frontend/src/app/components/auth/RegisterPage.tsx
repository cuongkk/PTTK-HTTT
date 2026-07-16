import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Loader2, MailCheck, UserPlus } from "lucide-react";
import { ApiError } from "../../services/apiClient";
import {
  registerCustomer,
  resendRegistrationOtp,
  verifyRegistration,
  type OtpChallengeResponse,
  type RegisterCustomerRequest,
} from "../../services/system-admin/authService";

const initialForm: RegisterCustomerRequest = {
  fullName: "",
  phoneNumber: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [challenge, setChallenge] = useState<OtpChallengeResponse | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof RegisterCustomerRequest, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submitRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      setChallenge(await registerCustomer(form));
      setOtp("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi đăng ký. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await verifyRegistration(form.username, otp);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể xác thực OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setSubmitting(true);
    try {
      setChallenge(await resendRegistrationOtp(form.username));
      setOtp("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi lại OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate("/login")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
        </button>
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
          <div className="bg-blue-600 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3"><Building2 className="h-7 w-7" /></div>
              <div><h1 className="text-2xl font-bold">Đăng ký tài khoản khách hàng</h1><p className="mt-1 text-blue-100">Tạo tài khoản để đăng ký thuê và theo dõi quá trình nhận phòng</p></div>
            </div>
          </div>

          <div className="p-8">
            {error && <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

            {success ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Đăng ký thành công</h2>
                <p className="mx-auto mt-2 max-w-lg text-gray-600">{success}</p>
                <button onClick={() => navigate("/login")} className="mt-7 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700">Đi đến đăng nhập</button>
              </div>
            ) : challenge ? (
              <form onSubmit={confirmOtp} className="mx-auto max-w-lg py-4 text-center">
                <MailCheck className="mx-auto h-14 w-14 text-blue-600" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">Xác thực email</h2>
                <p className="mt-2 text-sm text-gray-600">Nhập mã OTP 6 số đã gửi đến <strong>{challenge.maskedEmail}</strong>. Mã có hiệu lực trong 10 phút.</p>
                {challenge.demoOtp && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"><span className="text-sm">Mã OTP demo</span><div className="mt-1 font-mono text-2xl font-bold tracking-[0.35em]">{challenge.demoOtp}</div></div>}
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="000000" />
                <button disabled={submitting || otp.length !== 6} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">{submitting && <Loader2 className="h-5 w-5 animate-spin" />}Xác nhận đăng ký</button>
                <button type="button" disabled={submitting} onClick={resendOtp} className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">Gửi lại mã OTP</button>
              </form>
            ) : (
              <form onSubmit={submitRegistration}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Họ và tên" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="Nguyễn Văn An" />
                  <Field label="Số điện thoại" value={form.phoneNumber} onChange={(v) => update("phoneNumber", v)} placeholder="0912345678" />
                  <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="an.nguyen@gmail.com" />
                  <Field label="Tên đăng nhập" value={form.username} onChange={(v) => update("username", v.toLowerCase())} placeholder="nguyenvanan" />
                  <Field label="Mật khẩu" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Tối thiểu 8 ký tự" />
                  <Field label="Nhập lại mật khẩu" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} placeholder="Nhập lại mật khẩu" />
                </div>
                <p className="mt-4 text-xs text-gray-500">Mật khẩu gồm ít nhất 8 ký tự, có chữ hoa, chữ thường và chữ số.</p>
                <button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}Gửi đăng ký</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span><input required type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></label>;
}
