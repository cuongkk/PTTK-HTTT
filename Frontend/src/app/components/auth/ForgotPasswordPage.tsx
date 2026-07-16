import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { ApiError } from "../../services/apiClient";
import { requestPasswordReset, resetPassword, type OtpChallengeResponse } from "../../services/system-admin/authService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedEmail = searchParams.get("email") ?? "";
  const linkedOtp = searchParams.get("otp") ?? "";
  const [email, setEmail] = useState(linkedEmail);
  const [challenge, setChallenge] = useState<OtpChallengeResponse | null>(() => linkedEmail && linkedOtp ? {
    reference: linkedEmail,
    maskedEmail: linkedEmail,
    expiresAt: "",
    demoOtp: linkedOtp,
    demoResetLink: null,
    message: "Liên kết đặt lại mật khẩu đã được xác thực.",
  } : null);
  const [otp, setOtp] = useState(linkedOtp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sendOtp = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      setChallenge(await requestPasswordReset(email));
      setOtp("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi mã OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await resetPassword(email, otp, newPassword, confirmPassword);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate("/login")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Quay lại đăng nhập</button>
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white"><Building2 className="h-7 w-7" /></div><h1 className="mt-4 text-2xl font-bold text-gray-900">Quên mật khẩu</h1><p className="mt-2 text-sm text-gray-600">Xác thực email để tạo mật khẩu mới</p></div>
          {error && <div className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

          {success ? (
            <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-green-500" /><h2 className="mt-4 text-xl font-bold">Đặt lại mật khẩu thành công</h2><p className="mt-2 text-gray-600">{success}</p><button onClick={() => navigate("/login")} className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white">Đăng nhập ngay</button></div>
          ) : !challenge ? (
            <form onSubmit={sendOtp} className="mt-7"><label className="block text-sm font-semibold text-gray-700">Email đã xác thực</label><div className="relative mt-2"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" /></div><button disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}Gửi mã xác thực</button></form>
          ) : (
            <form onSubmit={submitReset} className="mt-7 space-y-4">
              <p className="text-center text-sm text-gray-600">Mã OTP đã gửi đến <strong>{challenge.maskedEmail}</strong></p>
              {challenge.demoOtp && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-amber-800"><span className="text-xs">Mã OTP demo</span><div className="font-mono text-xl font-bold tracking-[0.3em]">{challenge.demoOtp}</div></div>}
              {challenge.demoResetLink && <a href={challenge.demoResetLink} className="block rounded-xl border border-blue-200 bg-blue-50 p-3 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100">Mở liên kết đặt lại mật khẩu demo</a>}
              <label className="block"><span className="text-sm font-semibold text-gray-700">Mã OTP</span><input required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-blue-500" placeholder="000000" /></label>
              <label className="block"><span className="text-sm font-semibold text-gray-700">Mật khẩu mới</span><input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" /></label>
              <label className="block"><span className="text-sm font-semibold text-gray-700">Nhập lại mật khẩu</span><input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500" /></label>
              <button disabled={submitting || otp.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">{submitting && <Loader2 className="h-5 w-5 animate-spin" />}Đặt lại mật khẩu</button>
              <button type="button" disabled={submitting} onClick={() => sendOtp()} className="w-full text-sm font-semibold text-blue-600">Gửi lại mã OTP</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
