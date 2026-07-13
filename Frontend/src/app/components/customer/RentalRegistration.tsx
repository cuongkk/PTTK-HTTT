import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { customerWorkflowService, type CustomerRoomContext } from "../../services/customerWorkflowService";

const DEMO_DOCUMENT_URL = "/demo/demo-document.png";

export function RentalRegistration() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const moveInDate = searchParams.get("moveInDate") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [context, setContext] = useState<CustomerRoomContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    Promise.all([roomService.getAll(), roomId ? customerWorkflowService.getRoomContext(roomId) : Promise.resolve(null)])
      .then(([items, roomContext]) => {
        setRoom(items.find((item) => item.roomId === roomId) ?? null);
        setContext(roomContext);
      })
      .finally(() => setLoading(false));
  }, [roomId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId) return;
    const data = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);
    try {
      const result = await customerWorkflowService.createRentalApplication({
        roomId,
        fullName: String(data.get("fullName") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? "") || undefined,
        numberOfPeople: Number(data.get("numberOfPeople") ?? 1),
        gender: String(data.get("gender") ?? "Nam"),
        nationality: String(data.get("nationality") ?? "Việt Nam"),
        documentType: String(data.get("documentType") ?? "CCCD"),
        documentNumber: String(data.get("documentNumber") ?? ""),
        documentImageUrl: DEMO_DOCUMENT_URL,
        dateOfBirth: String(data.get("dateOfBirth") ?? "") || undefined,
        permanentAddress: String(data.get("permanentAddress") ?? "") || undefined,
        financialDocumentUrl: DEMO_DOCUMENT_URL,
        expectedMoveInDate: String(data.get("expectedMoveInDate") ?? ""),
        expectedRentalMonths: Number(data.get("expectedRentalMonths") ?? 6),
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
  if (loading) return <p className="text-gray-600">Đang tải thông tin phòng...</p>;
  if (!room) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Không tìm thấy phòng/giường đã chọn.</div>;
  if (submitted)
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Đăng ký đã được tiếp nhận</h1>
        <p className="mt-2 text-gray-600">Hệ thống sẽ thông báo khi lịch xem phòng được sắp xếp.</p>
        <p className="mt-2 text-sm font-semibold text-blue-700">Mã hồ sơ: {applicationId}</p>
        <button onClick={() => navigate("/customer/my-rooms?tab=viewed")} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
          Xem phòng đã xem
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
          onClick={() => navigate("/customer/rooms")}
          className="ml-auto flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại
        </button>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold">Thông tin đăng ký ban đầu</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Họ và tên<input name="fullName" defaultValue={context?.customerName} required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Số điện thoại<input name="phone" defaultValue={context?.phone} required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">Email<input name="email" type="email" defaultValue={context?.email ?? ""} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label>
          <label className="text-sm font-medium">
            Số người dự kiến ở<input name="numberOfPeople" required type="number" min="1" max={room.capacity} defaultValue={context?.numberOfPeople ?? 1} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Giới tính
            <select name="gender" defaultValue={context?.gender ?? "Nam"} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option>Nam</option>
              <option>Nữ</option>
              <option>Nhóm hỗn hợp</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Quốc tịch
            <input name="nationality" required defaultValue={context?.nationality ?? "Việt Nam"} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Loại giấy tờ
            <select name="documentType" required className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
              <option>CCCD</option>
              <option>Hộ chiếu</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Số CCCD
            <input name="documentNumber" required inputMode="numeric" defaultValue={context?.nationalId ?? ""} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Ảnh giấy tờ demo
            <img src={DEMO_DOCUMENT_URL} alt="Tài liệu minh chứng demo" className="mt-2 h-28 w-full rounded-lg border border-gray-200 object-cover" />
          </label>
          <label className="text-sm font-medium">
            Ngày sinh
            <input name="dateOfBirth" required type="date" defaultValue={context?.dateOfBirth ?? ""} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Địa chỉ thường trú
            <input name="permanentAddress" required defaultValue={context?.address ?? ""} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Tài liệu tài chính demo
            <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">Sử dụng chung ảnh tài liệu demo của hệ thống.</div>
          </label>
          <label className="text-sm font-medium">
            Ngày dự kiến vào
            <input name="expectedMoveInDate" required type="date" defaultValue={moveInDate} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
          </label>
          <label className="text-sm font-medium">
            Thời hạn thuê
            <select name="expectedRentalMonths" defaultValue={context?.expectedRentalMonths ?? 6} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5">
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
          <button type="button" onClick={() => navigate("/customer/rooms")} className="rounded-lg border border-gray-300 px-4 py-2.5">
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
