import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { customerWorkflowService } from "../../services/customerWorkflowService";

const DEMO_DOCUMENT_URL = "/demo/demo-document.png";

export function RentalRegistration() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);
    try {
      const result = await customerWorkflowService.createRentalApplication({
        numberOfPeople: Number(data.get("numberOfPeople") ?? 1),
        gender: String(data.get("gender") ?? "Nam"),
        financialDocumentUrl: DEMO_DOCUMENT_URL,
        expectedMoveInDate: String(data.get("expectedMoveInDate") ?? ""),
        expectedRentalMonths: Number(data.get("expectedRentalMonths") ?? 6),
        desiredArea: String(data.get("desiredArea") ?? "") || undefined,
        desiredRoomType: String(data.get("desiredRoomType") ?? "") || undefined,
        minimumPrice: Number(data.get("minimumPrice") ?? 0) || undefined,
        maximumPrice: Number(data.get("maximumPrice") ?? 0) || undefined,
        livingSchedule: String(data.get("livingSchedule") ?? "") || undefined,
        requiresQuietLifestyle: data.get("requiresQuietLifestyle") === "on",
        requiresParking: data.get("requiresParking") === "on",
        requiresAirConditioner: data.get("requiresAirConditioner") === "on",
        otherRequirements: String(data.get("otherRequirements") ?? "") || undefined,
      });
      setApplicationId(result.applicationId);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể gửi đăng ký thuê.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (submitted)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Đăng ký đã được tiếp nhận</h1>
        <p className="mt-2 text-gray-600">Hệ thống sẽ thông báo khi lịch xem phòng được sắp xếp.</p>
        <p className="mt-2 text-sm font-semibold text-blue-700">Mã hồ sơ: {applicationId}</p>
        <button onClick={() => navigate("/customer/my-rooms?tab=viewed")} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
          Xem lịch xem phòng
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex w-full items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Đăng ký thuê và xem phòng</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("/customer/my-rooms")}
          className="ml-auto flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </button>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">Thông tin đăng ký ban đầu</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Số người dự kiến ở<input name="numberOfPeople" required type="number" min="1" defaultValue={1} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Giới tính
            <select name="gender" defaultValue="Nam" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option>Nam</option>
              <option>Nữ</option>
              <option>Nhóm hỗn hợp</option>
            </select>
          </label>
          <label className="text-sm font-medium">Khu vực mong muốn<input name="desiredArea" required placeholder="Ví dụ: Quận 5" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Hình thức thuê<select name="desiredRoomType" required defaultValue="nguyen_can" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="nguyen_can">Thuê nguyên phòng</option><option value="ghep">Thuê giường ở ghép</option></select></label>
          <label className="text-sm font-medium">Mức giá tối thiểu<input name="minimumPrice" type="number" min="0" step="100000" placeholder="VNĐ/tháng" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Mức giá tối đa<input name="maximumPrice" required type="number" min="0" step="100000" placeholder="VNĐ/tháng" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">
            Ngày dự kiến vào
            <input name="expectedMoveInDate" required type="date" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Thời hạn thuê
            <select name="expectedRentalMonths" defaultValue={6} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option value="6">6 tháng</option>
              <option value="12">12 tháng</option>
              <option value="18">Trên 12 tháng</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Giờ giấc sinh hoạt
            <input name="livingSchedule" placeholder="Ví dụ: về trước 23:00" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="requiresQuietLifestyle" type="checkbox" />
            Ưu tiên yên tĩnh
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="requiresParking" type="checkbox" />
            Có nhu cầu gửi xe
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="requiresAirConditioner" type="checkbox" />
            Cần điều hòa
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Yêu cầu khác
            <textarea name="otherRequirements" rows={3} className="mt-2 w-full rounded-lg border border-gray-300 p-3" />
          </label>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/customer/my-rooms")} className="rounded-lg border border-gray-300 px-4 py-2.5">
            Quay lại
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
            {isSubmitting ? "Đang gửi..." : "Đăng ký thuê"}
          </button>
        </div>
      </form>
    </div>
  );
}
