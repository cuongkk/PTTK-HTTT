import { FormEvent, useEffect, useState } from "react";
import { roomService, type ResidenceRule } from "../../services/system-admin/roomService";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  AlertCircle,
  Bell,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  Home,
  KeyRound,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { customerWorkflowService, type CustomerRoomSummary, type DepositRequestDetail, type ViewedRoom } from "../../services/customerWorkflowService";

type RoomTab = "viewed" | "deposited" | "renting";

const roomTabs: Array<{ value: RoomTab; label: string }> = [
  { value: "viewed", label: "Đã xem" },
  { value: "deposited", label: "Đã đặt cọc" },
  { value: "renting", label: "Đang thuê" },
];

function PageHeader({ title, backTo }: { title: string; backTo?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex w-full items-start gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
      {backTo && (
        <button onClick={() => navigate(backTo)} className="ml-auto flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-600 hover:bg-gray-50">
          <ChevronLeft className="h-5 w-5" /> Quay lại
        </button>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function StatusBanner({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" }) {
  const styles = tone === "green" ? "bg-green-50 text-green-800 border-green-200" : tone === "amber" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function CustomerRooms() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [viewedRooms, setViewedRooms] = useState<ViewedRoom[]>([]);
  const [depositedRooms, setDepositedRooms] = useState<CustomerRoomSummary[]>([]);
  const [rentingRooms, setRentingRooms] = useState<CustomerRoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const requestedTab = params.get("tab") as RoomTab | null;
  const tab: RoomTab = roomTabs.some((item) => item.value === requestedTab) ? requestedTab! : "viewed";

  useEffect(() => {
    Promise.all([customerWorkflowService.getViewedRooms(), customerWorkflowService.getDepositedRooms(), customerWorkflowService.getRentingRooms()])
      .then(([viewed, deposited, renting]) => {
        setViewedRooms(viewed);
        setDepositedRooms(deposited);
        setRentingRooms(renting);
      })
      .catch((error) => setRoomsError(error.message))
      .finally(() => setLoadingRooms(false));
  }, []);

  const summaryRooms = tab === "deposited" ? depositedRooms : rentingRooms;
  const rooms =
    tab === "viewed"
      ? viewedRooms.map((room) => ({
          id: room.roomId,
          name: room.roomName,
          bed: room.bedNumber ? `Giường ${room.bedNumber.toString().padStart(2, "0")}` : "Nguyên phòng",
          branch: room.branchName,
          price: `${room.monthlyRent.toLocaleString("vi-VN")} đ/tháng`,
          date: `Đã xem ${new Date(room.viewedAt).toLocaleDateString("vi-VN")}`,
          applicationId: room.applicationId,
          applicationStatus: room.applicationStatus,
        }))
      : summaryRooms.map((room) => ({
          id: room.roomId,
          name: room.roomName,
          bed: room.bedNumber ? `Giường ${room.bedNumber.toString().padStart(2, "0")}` : "Nguyên phòng",
          branch: room.branchName,
          price: `${room.monthlyRent.toLocaleString("vi-VN")} đ/tháng`,
          date: `${tab === "deposited" ? "Đã cọc" : "Từ"} ${new Date(room.relevantAt).toLocaleDateString("vi-VN")}`,
          applicationId: "",
          applicationStatus: room.applicationStatus,
        }));

  return (
    <div className="space-y-6">
      <PageHeader title="Phòng/giường của tôi" />
      <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-2">
        {roomTabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setParams({ tab: item.value })}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === item.value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loadingRooms && <p className="text-sm text-gray-500">Đang tải danh sách phòng/giường...</p>}
      {roomsError && <StatusBanner tone="amber">{roomsError}</StatusBanner>}
      <div className="grid gap-4">
        {rooms.map((room) => (
          <article key={room.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-xl bg-blue-50 text-blue-600">
                  <BedDouble className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{room.name}</h2>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{room.bed}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {room.branch}
                  </p>
                  <p className="mt-2 font-semibold text-blue-700">{room.price}</p>
                  <p className="mt-1 text-xs text-gray-500">{room.date}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === "viewed" && room.applicationStatus === "da_xem_phong" && (
                  <button
                    onClick={() => navigate(`/customer/deposit-requests/${room.applicationId}__${room.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Yêu cầu đặt cọc
                  </button>
                )}
                {tab === "viewed" && room.applicationStatus === "cho_ra_soat_coc" && (
                  <span className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Đang chờ rà soát đặt cọc</span>
                )}
                {tab === "deposited" && (
                  <>
                    <button
                      onClick={() => navigate(`/customer/check-ins/NP-${room.id}${room.applicationStatus === "du_dieu_kien_nhan_phong" ? "?profileApproved=true" : ""}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {room.applicationStatus === "du_dieu_kien_nhan_phong" ? "Xem và ký hợp đồng" : "Bổ sung thông tin"}
                    </button>
                    <button
                      onClick={() => navigate(`/customer/checkouts/TP-${room.id}/reconciliation`)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Yêu cầu hoàn tiền
                    </button>
                  </>
                )}
                {tab === "renting" && (
                  <button
                    onClick={() => navigate(`/customer/checkouts/TP-${room.id}/reconciliation`)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Yêu cầu trả phòng
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DepositRequest() {
  const navigate = useNavigate();
  const { depositRequestId } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [detail, setDetail] = useState<DepositRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, roomId] = (depositRequestId ?? "").split("__");

  useEffect(() => {
    if (!applicationId || !roomId) {
      setError("Đường dẫn yêu cầu đặt cọc không hợp lệ.");
      setLoading(false);
      return;
    }
    customerWorkflowService
      .getDepositRequest(applicationId, roomId)
      .then(setDetail)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [applicationId, roomId]);

  const submitDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      await customerWorkflowService.submitDepositRequest(applicationId, roomId, {
        primaryTenant: {
          gender: String(form.get("gender")),
          nationality: String(form.get("nationality")),
        },
        accompanyingTenants: Array.from({ length: detail.viewedRoom.applicant.numberOfPeople - 1 }, (_, index) => ({
          fullName: String(form.get(`member-${index}-fullName`)),
          gender: String(form.get(`member-${index}-gender`)),
          nationality: String(form.get(`member-${index}-nationality`)),
        })),
      });
      setSubmitted(true);
    } catch (requestError: any) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-600">Đang tải hồ sơ đã xem phòng...</p>;
  if (!detail)
    return (
      <div className="space-y-6">
        <PageHeader title="Yêu cầu đặt cọc" backTo="/customer/my-rooms?tab=viewed" />
        <StatusBanner tone="amber">{error || "Không tìm thấy hồ sơ đã xem phòng."}</StatusBanner>
      </div>
    );
  const viewedRoom = detail.viewedRoom;

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="Yêu cầu đặt cọc" backTo="/customer/my-rooms?tab=viewed" />
        <Section title="Yêu cầu đã được gửi">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h3 className="mt-3 text-xl font-bold">Đang chờ rà soát</h3>
            <p className="mt-2 text-gray-600">Hệ thống sẽ thông báo khi hồ sơ được duyệt và khoản cọc sẵn sàng thanh toán.</p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Yêu cầu đặt cọc" backTo="/customer/my-rooms?tab=viewed" />
      {error && <StatusBanner tone="amber">{error}</StatusBanner>}
      <form onSubmit={submitDeposit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Thông tin đã đăng ký khi xem phòng">
            <div className="grid gap-x-6 md:grid-cols-2">
              <InfoRow label="Họ và tên" value={viewedRoom.applicant.fullName} />
              <InfoRow label="Số điện thoại" value={viewedRoom.applicant.phone} />
              <InfoRow label="Email" value={viewedRoom.applicant.email || "-"} />
              <InfoRow label="Quốc tịch" value={viewedRoom.applicant.nationality || "-"} />
              <InfoRow label="Loại giấy tờ" value={viewedRoom.applicant.documentType || "-"} />
              <InfoRow label="Số giấy tờ" value={viewedRoom.applicant.documentNumber || "-"} />
              <InfoRow label="Ảnh giấy tờ" value={viewedRoom.applicant.documentImageUrl || "-"} />
              <InfoRow label="Ngày sinh" value={viewedRoom.applicant.dateOfBirth ? new Date(viewedRoom.applicant.dateOfBirth).toLocaleDateString("vi-VN") : "-"} />
              <InfoRow label="Địa chỉ thường trú" value={viewedRoom.applicant.permanentAddress || "-"} />
              <InfoRow label="Tài liệu tài chính" value={viewedRoom.applicant.financialDocumentUrl || "Không có"} />
              <InfoRow label="Số người dự kiến ở" value={`${viewedRoom.applicant.numberOfPeople} người`} />
              <InfoRow label="Giới tính" value={viewedRoom.applicant.gender} />
              <InfoRow label="Hình thức thuê" value={viewedRoom.applicant.roomType === "ghep" ? "Ở ghép" : "Nguyên phòng"} />
              <InfoRow label="Ngày dự kiến vào" value={viewedRoom.applicant.expectedMoveInDate ? new Date(viewedRoom.applicant.expectedMoveInDate).toLocaleDateString("vi-VN") : "-"} />
              <InfoRow label="Thời hạn thuê" value={viewedRoom.applicant.expectedRentalMonths ? `${viewedRoom.applicant.expectedRentalMonths} tháng` : "-"} />
              <InfoRow label="Giờ giấc sinh hoạt" value={viewedRoom.applicant.livingSchedule || "-"} />
              <InfoRow
                label="Tiêu chí ưu tiên"
                value={
                  [viewedRoom.applicant.requiresQuietLifestyle && "Yên tĩnh", viewedRoom.applicant.requiresParking && "Gửi xe", viewedRoom.applicant.requiresAirConditioner && "Điều hòa"]
                    .filter(Boolean)
                    .join(", ") || "Không có"
                }
              />
              <InfoRow label="Yêu cầu khác" value={viewedRoom.applicant.otherRequirements || "-"} />
            </div>
          </Section>
          <Section title="Thông tin cần bổ sung để đặt cọc">
            <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-3 py-3">Họ và tên</th>
                    <th className="px-3 py-3">Giới tính</th>
                    <th className="px-3 py-3">Quốc tịch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 align-top">
                    <td className="p-3">
                      <input value={viewedRoom.applicant.fullName} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5" />
                    </td>
                    <td className="p-3">
                      <select name="gender" required defaultValue={viewedRoom.applicant.gender ?? "Nam"} className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
                        <option value="Nam">Nam</option>
                        <option value="Nu">Nữ</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input name="nationality" required defaultValue={viewedRoom.applicant.nationality ?? "Việt Nam"} className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
                    </td>
                  </tr>
                  {Array.from({ length: viewedRoom.applicant.numberOfPeople - 1 }, (_, index) => (
                    <tr key={index} className="border-t border-gray-200 align-top">
                      <td className="p-3">
                        <input name={`member-${index}-fullName`} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
                      </td>
                      <td className="p-3">
                        <select name={`member-${index}-gender`} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5">
                          <option value="Nam">Nam</option>
                          <option value="Nu">Nữ</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input name={`member-${index}-nationality`} required defaultValue="Việt Nam" className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
        <Section title="Thông tin đặt cọc">
          <InfoRow label="Chi nhánh" value={viewedRoom.branchName} />
          <InfoRow label="Phòng/giường" value={`${viewedRoom.roomName}${viewedRoom.bedNumber ? ` - Giường ${viewedRoom.bedNumber}` : " - Nguyên phòng"}`} />
          <InfoRow label="Hình thức" value={viewedRoom.roomType === "ghep" ? "Ở ghép" : "Nguyên phòng"} />
          <InfoRow label="Ngày dự kiến nhận" value={viewedRoom.applicant.expectedMoveInDate ? new Date(viewedRoom.applicant.expectedMoveInDate).toLocaleDateString("vi-VN") : "-"} />
          <InfoRow label="Thời hạn thuê" value={viewedRoom.applicant.expectedRentalMonths ? `${viewedRoom.applicant.expectedRentalMonths} tháng` : "-"} />
          <InfoRow label="Giá thuê" value={`${viewedRoom.monthlyRent.toLocaleString("vi-VN")} đ/tháng`} />
          <InfoRow label="Tiền cọc dự kiến" value={`${detail.estimatedDepositAmount.toLocaleString("vi-VN")} đ`} />
          <InfoRow label="Công thức" value={detail.depositFormula} />
          <InfoRow label="Hạn thanh toán" value={detail.paymentDueDescription} />
          <button type="submit" disabled={submitting} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:bg-gray-300">
            {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt cọc"}
          </button>
        </Section>
      </form>
    </div>
  );
}

function PaymentPage({ kind }: { kind: "deposit" | "checkin" }) {
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);
  const isDeposit = kind === "deposit";
  const amount = isDeposit ? "3.000.000 đ" : "1.850.000 đ";
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={isDeposit ? "Thanh toán tiền cọc" : "Thanh toán khoản nhận phòng"} backTo={isDeposit ? "/customer/my-rooms?tab=viewed" : "/customer/my-rooms?tab=deposited"} />
      {paid ? (
        <Section title="Đã ghi nhận giao dịch">
          <div className="text-center">
            <Clock3 className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-3 text-xl font-bold">Đang chờ đối chiếu</h3>
            <p className="mt-2 text-gray-600">Bạn không cần thanh toán lại trong thời gian xử lý.</p>
            <button
              onClick={() => navigate(isDeposit ? "/customer/my-rooms?tab=deposited" : "/customer/handovers/BBBG-P_Q5_201")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white"
            >
              Mô phỏng: tiếp tục
            </button>
          </div>
        </Section>
      ) : (
        <>
          <Section title="Chi tiết khoản thu">
            <InfoRow label="Loại khoản thu" value={isDeposit ? "Tiền cọc" : "Tiền thuê kỳ đầu và dịch vụ"} />
            <InfoRow label="Phòng/giường" value="P_Q5_201 - Nguyên phòng" />
            <InfoRow label="Số tiền" value={amount} />
            <InfoRow label="Hạn thanh toán" value="23:59 ngày 12/07/2026" />
          </Section>
          <Section title="Chuyển khoản">
            <div className="grid items-center gap-6 md:grid-cols-[180px_1fr]">
              <div className="flex h-44 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">Mã QR thanh toán</div>
              <div>
                <InfoRow label="Ngân hàng" value="Vietcombank" />
                <InfoRow label="Số tài khoản" value="0123456789" />
                <InfoRow label="Nội dung" value={isDeposit ? "COC YC-P_Q5_101" : "NHANPHONG P_Q5_201"} />
                <label className="mt-4 block text-sm font-medium text-gray-700">
                  Chứng từ
                  <input type="file" className="mt-2 block w-full text-sm" />
                </label>
              </div>
            </div>
            <button onClick={() => setPaid(true)} className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
              Tôi đã thanh toán
            </button>
          </Section>
        </>
      )}
    </div>
  );
}

export function DepositPayment() {
  return <PaymentPage kind="deposit" />;
}
export function CheckInPayment() {
  return <PaymentPage kind="checkin" />;
}

export function CustomerCheckIn() {
  const [submitted, setSubmitted] = useState(false);
  const [params] = useSearchParams();
  const profileApproved = params.get("profileApproved") === "true";
  const [showContract, setShowContract] = useState(profileApproved);
  const [signatureName, setSignatureName] = useState("");
  const [residenceRules, setResidenceRules] = useState<ResidenceRule[]>([]);
  useEffect(() => {
    roomService.getResidenceRules("P_Q5_201").then(setResidenceRules).catch(() => setResidenceRules([]));
  }, []);
  if (showContract)
    return (
      <div className="space-y-6">
        <PageHeader title="Xem và ký hợp đồng" backTo="/customer/my-rooms?tab=deposited" />
        <Section title="Hợp đồng thuê">
          <div className="space-y-5 rounded-lg bg-gray-50 p-5 text-sm leading-6 text-gray-700">
            <h3 className="text-center text-lg font-bold">HỢP ĐỒNG THUÊ CHỖ Ở</h3>
            <div>
              <h4 className="font-bold text-gray-900">1. Thông tin các bên</h4>
              <p>Bên cho thuê: HomeStay Dorm - Chi nhánh Quận 5.</p>
              <p>Bên thuê: Nguyễn Gia Bảo. Danh sách người ở kèm theo lấy từ hồ sơ đã được Quản lý xác nhận.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">2. Phòng/giường và thời hạn thuê</h4>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <p>
                  Phòng thuê: <strong>Phòng 201</strong>
                </p>
                <p>
                  Hình thức: <strong>Thuê nguyên phòng</strong>
                </p>
                <p>
                  Số người đăng ký: <strong>2 người</strong>
                </p>
                <p>
                  Số giường sử dụng: <strong>Toàn bộ giường trong phòng</strong>
                </p>
                <p>
                  Ngày bắt đầu: <strong>01/08/2026</strong>
                </p>
                <p>
                  Thời hạn: <strong>12 tháng</strong>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">3. Giá thuê và kỳ thanh toán</h4>
              <p>
                Giá thuê nguyên phòng: <strong>4.500.000 đồng/tháng</strong>.
              </p>
              <p>Kỳ thanh toán: hàng tháng, thanh toán trước ngày 01 của mỗi tháng. Khoản thu nhận phòng gồm tiền thuê kỳ đầu và các dịch vụ phát sinh theo yêu cầu.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">4. Phí dịch vụ</h4>
              <div className="mt-2 overflow-hidden rounded-lg border bg-white">
                <div className="grid grid-cols-3 border-b bg-gray-100 px-3 py-2 font-semibold">
                  <span>Dịch vụ</span>
                  <span>Đơn giá</span>
                  <span>Cách tính</span>
                </div>
                {[
                  ["Điện", "4.000 đ/kWh", "Theo công tơ"],
                  ["Nước", "20.000 đ/m³", "Theo đồng hồ"],
                  ["WiFi", "150.000 đ/phòng/tháng", "Theo tháng"],
                  ["Gửi xe", "100.000 đ/xe/tháng", "Theo số xe"],
                ].map((row) => (
                  <div key={row[0]} className="grid grid-cols-3 border-b px-3 py-2 last:border-0">
                    <span>{row[0]}</span>
                    <span>{row[1]}</span>
                    <span>{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">5. Tiền cọc và hoàn/khấu trừ cọc</h4>
              <p>
                Tiền cọc: <strong>9.000.000 đồng</strong>.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">6. Nội quy lưu trú</h4>
              {residenceRules.length === 0 ? <p className="text-gray-500">Đang tải nội quy của chi nhánh...</p> : (
                <ul className="space-y-2">
                  {residenceRules.map((rule) => <li key={rule.residenceRuleId}><strong>{rule.title}:</strong> {rule.content}</li>)}
                </ul>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">7. Xử lý vi phạm</h4>
              <ul className="space-y-1">
                {residenceRules.map((rule) => <li key={rule.residenceRuleId}>{rule.title}: {rule.violationLevel === "nhac_nho" ? "Nhắc nhở" : rule.violationLevel === "boi_thuong" ? "Bồi thường theo thiệt hại thực tế" : `Khấu trừ cọc${rule.defaultPenaltyAmount ? ` ${rule.defaultPenaltyAmount.toLocaleString("vi-VN")} đồng` : ""}`}.</li>)}
              </ul>
            </div>
          </div>
          <label className="mt-5 block text-sm font-medium text-gray-700">
            Nhập họ và tên người ký
            <input
              required
              value={signatureName}
              onChange={(event) => setSignatureName(event.target.value)}
              placeholder="Ví dụ: Nguyễn Gia Bảo"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>
          <button disabled={!signatureName.trim()} className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:bg-gray-300">
            Ký hợp đồng
          </button>
        </Section>
      </div>
    );
  if (submitted)
    return (
      <div className="space-y-6">
        <PageHeader title="Bổ sung hồ sơ nhận phòng" backTo="/customer/my-rooms?tab=deposited" />
        <StatusBanner tone="amber">Hồ sơ đã được gửi và đang chờ Quản lý kiểm tra. Hợp đồng chỉ hiển thị sau khi toàn bộ người ở được xác nhận đủ điều kiện.</StatusBanner>
      </div>
    );
  return (
    <div className="space-y-6">
      <PageHeader title="Bổ sung hồ sơ nhận phòng" backTo="/customer/my-rooms?tab=deposited" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <Section title="Danh sách người ở chính thức">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Quốc tịch</th>
                  <th className="p-3">Ngày sinh</th>
                  <th className="p-3">Số CCCD/Hộ chiếu</th>
                  <th className="p-3">Ảnh minh chứng</th>
                  <th className="p-3">Địa chỉ cư trú</th>
                  <th className="p-3">Nghề nghiệp</th>
                </tr>
              </thead>
              <tbody>
                {["Nguyễn Gia Bảo", ""].map((name, index) => (
                  <tr key={index} className="border-t align-top">
                    <td className="p-2">
                      <input required defaultValue={name} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <select required className="w-full rounded border px-2 py-2">
                        <option>Nữ</option>
                        <option>Nam</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input required defaultValue="Việt Nam" className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required type="date" defaultValue={index === 0 ? "2003-05-12" : ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={index === 0 ? "079203000001" : ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      {index === 0 && <span className="mb-1 block text-xs text-gray-500">Đã có: cccd-nguyen-gia-bao.jpg</span>}
                      <input required={index !== 0} type="file" accept="image/*" className="w-full text-xs" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={index === 0 ? "25 Nguyễn Trãi, Quận 5, TP.HCM" : ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={index === 0 ? "Sinh viên Đại học Công nghệ" : ""} className="w-full rounded border px-2 py-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            {!profileApproved && (
              <button type="submit" className="rounded-lg border border-blue-600 px-5 py-2.5 font-semibold text-blue-600">
                Gửi hồ sơ để Quản lý kiểm tra
              </button>
            )}
            {profileApproved && (
              <button type="button" onClick={() => setShowContract(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
                Thuê
              </button>
            )}
          </div>
        </Section>
      </form>
    </div>
  );
}

export function HandoverConfirmation() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Biên bản bàn giao" backTo="/customer/my-rooms?tab=deposited" />
      <Section title="Thông tin bàn giao">
        <InfoRow label="Phòng" value="P_Q5_201" />
        <InfoRow label="Ngày bàn giao" value="01/08/2026" />
        <InfoRow label="Chỉ số điện đầu" value="1.245 kWh" />
        <InfoRow label="Chỉ số nước đầu" value="382 m³" />
      </Section>
      <Section title="Tài sản">
        <div className="grid gap-3 md:grid-cols-2">
          {["Giường: 2 - Tốt", "Nệm: 2 - Tốt", "Tủ: 2 - Tốt", "Chìa khóa: 2", "Thẻ từ: 2", "Máy điều hòa: Hoạt động"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {item}
            </div>
          ))}
        </div>
        <label className="mt-5 block text-sm font-medium">
          Ý kiến của khách
          <textarea className="mt-2 w-full rounded-lg border border-gray-300 p-3" rows={3} />
        </label>
        <label className="mt-4 flex gap-3 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          Tôi xác nhận hiện trạng và tài sản bàn giao.
        </label>
        <button disabled={!confirmed} onClick={() => navigate("/customer/my-rooms?tab=renting")} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300">
          Xác nhận bàn giao
        </button>
      </Section>
    </div>
  );
}

export function CheckoutReconciliation() {
  const navigate = useNavigate();
  const { checkoutId } = useParams();
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader title="Xác nhận hiện trạng, đối soát và hoàn cọc" backTo="/customer/my-rooms?tab=renting" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Biên bản hiện trạng">
          <InfoRow label="Tình trạng phòng" value="Tốt" />
          <InfoRow label="Vệ sinh" value="Đạt" />
          <InfoRow label="Tài sản" value="Đầy đủ" />
          <InfoRow label="Điện cuối kỳ" value="1.380 kWh" />
          <InfoRow label="Nước cuối kỳ" value="401 m³" />
          <InfoRow label="Chi phí hư hỏng" value="0 đ" />
        </Section>
        <Section title="Kết quả đối soát">
          <InfoRow label="Tiền cọc gốc" value="9.000.000 đ" />
          <InfoRow label="Tỷ lệ hoàn" value="70%" />
          <InfoRow label="Tiền thuê còn nợ" value="0 đ" />
          <InfoRow label="Điện, nước, dịch vụ" value="420.000 đ" />
          <InfoRow label="Tổng được hoàn" value="5.880.000 đ" />
          <label className="mt-4 flex gap-3 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            Tôi đồng ý với biên bản và kết quả đối soát.
          </label>
        </Section>
      </div>
      <Section title="Phản hồi">
        <textarea rows={3} placeholder="Nhập ý kiến hoặc nội dung khiếu nại..." className="w-full rounded-lg border border-gray-300 p-3" />
        <div className="mt-4 flex justify-end gap-3">
          <button className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700">Gửi khiếu nại</button>
          <button
            disabled={!agreed}
            onClick={() => navigate(`/customer/checkout-payments/DT-${checkoutId}`)}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:bg-gray-300"
          >
            Xác nhận kết quả
          </button>
        </div>
      </Section>
    </div>
  );
}

export function CheckoutSettlement() {
  const navigate = useNavigate();
  const { settlementId } = useParams();
  const [method, setMethod] = useState("bank");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Nhận hoàn cọc" backTo="/customer/my-rooms?tab=renting" />
      <StatusBanner tone="green">
        Bạn được hoàn lại <strong>5.880.000 đ</strong> sau đối soát.
      </StatusBanner>
      <Section title="Phương thức nhận tiền">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMethod("bank")} className={`rounded-xl border p-4 text-left ${method === "bank" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
            <WalletCards className="mb-2 h-6 w-6" />
            <strong>Chuyển khoản</strong>
          </button>
          <button onClick={() => setMethod("cash")} className={`rounded-xl border p-4 text-left ${method === "cash" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
            <CreditCard className="mb-2 h-6 w-6" />
            <strong>Tiền mặt</strong>
          </button>
        </div>
        {method === "bank" && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Ngân hàng
              <input className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium">
              Số tài khoản
              <input className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Tên chủ tài khoản
              <input className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
            </label>
          </div>
        )}
        <button onClick={() => navigate(`/customer/checkouts/TP-P_Q5_102/liquidation`)} className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
          Xác nhận thông tin nhận tiền
        </button>
      </Section>
    </div>
  );
}

export function LiquidationConfirmation() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Biên bản trả phòng và thanh lý" backTo="/customer/my-rooms?tab=renting" />
      <Section title="Nội dung thanh lý">
        <InfoRow label="Hợp đồng" value="HĐT-P_Q5_102-2026" />
        <InfoRow label="Phòng/giường" value="P_Q5_102 - Giường 01" />
        <InfoRow label="Kết quả đối soát" value="Hoàn 5.880.000 đ" />
        <InfoRow label="Công nợ" value="0 đ" />
        <InfoRow label="Chìa khóa/thẻ" value="Đã thu hồi" />
        <InfoRow label="Trạng thái hoàn tiền" value="Đang xử lý" />
        <label className="mt-5 flex gap-3 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          Tôi xác nhận nội dung biên bản trả phòng và thanh lý.
        </label>
        <button disabled={!confirmed} onClick={() => navigate("/customer/my-rooms?tab=renting")} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300">
          Xác nhận thanh lý
        </button>
      </Section>
    </div>
  );
}

export function CustomerNotifications() {
  const [readIds, setReadIds] = useState<string[]>(["TB03"]);
  const notifications = [
    { id: "TB01", title: "Lịch xem phòng đã được sắp xếp", message: "Bạn có lịch xem P_Q5_101 lúc 09:00 ngày 14/07/2026.", time: "10 phút trước", icon: CalendarDays },
    { id: "TB02", title: "Yêu cầu đặt cọc đang được xử lý", message: "Hồ sơ YC-P_Q5_101 đã được tiếp nhận.", time: "2 giờ trước", icon: ReceiptText },
    { id: "TB03", title: "Thanh toán đã được xác nhận", message: "Khoản cọc 3.000.000 đ đã được xác nhận.", time: "Hôm qua", icon: CheckCircle2 },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Thông báo" />
      <div className="space-y-3">
        {notifications.map((item) => {
          const Icon = item.icon;
          const read = readIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setReadIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]))}
              className={`w-full rounded-xl border p-5 text-left ${read ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50"}`}
            >
              <div className="flex gap-4">
                <div className={`rounded-full p-2.5 ${read ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold text-gray-900">{item.title}</h2>
                    {!read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                  <p className="mt-2 text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
