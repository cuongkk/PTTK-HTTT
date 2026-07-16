import { useEffect, useState } from "react";
import { roomService, type ResidenceRule, type Room } from "../../services/system-admin/roomService";
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
import {
  customerWorkflowService,
  type CustomerCheckoutDetail,
  type CustomerContractDetail,
  type CustomerHandoverDetail,
  type CustomerServiceItem,
  type CustomerRoomContext,
  type CustomerRoomSummary,
  type DepositRequestDetail,
  type ViewedRoom,
} from "../../services/customerWorkflowService";
import { PaymentQrPanel } from "./PaymentQrPanel";

type RoomTab = "viewed" | "deposited" | "renting";

const roomTabs: Array<{ value: RoomTab; label: string }> = [
  { value: "viewed", label: "Lịch xem" },
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

function ReconciliationTable({ detail }: { detail: CustomerCheckoutDetail | null }) {
  const costLabels: Record<string, string> = {
    hu_hong: "Bồi thường hư hỏng tài sản",
    dien_nuoc: "Điện, nước và dịch vụ cuối kỳ",
    no_tien_thue: "Tiền thuê còn nợ",
    phat_vi_pham: "Phạt vi phạm hợp đồng",
    khac: "Khấu trừ khác",
  };
  const costs = detail?.costs ?? [];
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3">STT</th>
            <th className="px-4 py-3">Nội dung đối soát</th>
            <th className="px-4 py-3">Ghi chú</th>
            <th className="px-4 py-3 text-right">Số tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-4 py-3">1</td>
            <td className="px-4 py-3 font-medium">Tiền cọc ban đầu</td>
            <td className="px-4 py-3">Cọc theo hợp đồng {detail?.contractId ?? "-"}</td>
            <td className="px-4 py-3 text-right text-green-700">+{(detail?.originalDeposit ?? 0).toLocaleString("vi-VN")} đ</td>
          </tr>
          <tr>
            <td className="px-4 py-3">2</td>
            <td className="px-4 py-3 font-medium">Mức cọc được xét hoàn</td>
            <td className="px-4 py-3">Tỷ lệ {(detail?.refundRate ?? 0).toLocaleString("vi-VN")}%</td>
            <td className="px-4 py-3 text-right text-green-700">+{(detail?.baseRefund ?? 0).toLocaleString("vi-VN")} đ</td>
          </tr>
          {costs.map((cost, index) => (
            <tr key={`${cost.costType}-${index}`}>
              <td className="px-4 py-3">{index + 3}</td>
              <td className="px-4 py-3 font-medium">{costLabels[cost.costType] ?? cost.costType}</td>
              <td className="px-4 py-3">{cost.description}</td>
              <td className="px-4 py-3 text-right text-red-600">-{cost.amount.toLocaleString("vi-VN")} đ</td>
            </tr>
          ))}
          {costs.length === 0 && (
            <tr>
              <td className="px-4 py-3">3</td>
              <td className="px-4 py-3 font-medium">Các khoản khấu trừ</td>
              <td className="px-4 py-3 text-gray-500">Không có khoản chi tiết</td>
              <td className="px-4 py-3 text-right">0 đ</td>
            </tr>
          )}
        </tbody>
        <tfoot className="border-t-2 border-gray-300 bg-blue-50 font-semibold">
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right">
              Tổng khấu trừ
            </td>
            <td className="px-4 py-3 text-right text-red-700">-{(detail?.totalDeductions ?? 0).toLocaleString("vi-VN")} đ</td>
          </tr>
          <tr>
            <td colSpan={3} className="px-4 py-3 text-right">
              Kết quả cuối cùng
            </td>
            <td className="px-4 py-3 text-right text-blue-700">
              {(detail?.additionalPaymentAmount ?? 0) > 0
                ? `Thu thêm ${(detail?.additionalPaymentAmount ?? 0).toLocaleString("vi-VN")} đ`
                : `Hoàn ${(detail?.refundAmount ?? 0).toLocaleString("vi-VN")} đ`}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
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
          date: `${room.viewingStatus === "hoan_thanh" ? "Đã xem" : room.viewingStatus === "dang_xem" ? "Đang xem" : "Lịch hẹn"} ${new Date(room.viewedAt).toLocaleString("vi-VN")}`,
          applicationId: room.applicationId,
          applicationStatus: room.applicationStatus,
          scheduleId: room.scheduleId,
          viewingStatus: room.viewingStatus,
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
          workflowStatus: room.status,
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
                {tab === "viewed" && room.applicationStatus === "cho_khach_xac_nhan_dieu_kien_coc" && (
                  <button
                    onClick={() => navigate(`/customer/deposit-terms/${room.applicationId}__${room.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Xem và xác nhận điều kiện thuê
                  </button>
                )}
                {tab === "viewed" && room.applicationStatus === "cho_ke_toan_tinh_tien_coc" && (
                  <span className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Chờ Kế toán tính tiền cọc</span>
                )}
                {tab === "viewed" && room.applicationStatus === "cho_khach_thanh_toan_coc" && (
                  <button onClick={() => navigate(`/customer/deposit-payments/DT-${room.id}`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Thanh toán tiền cọc
                  </button>
                )}
                {tab === "viewed" && room.viewingStatus === "dang_xem" && (
                  <button onClick={() => navigate(`/customer/viewings/${room.scheduleId}`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Xem thông tin phòng đang xem
                  </button>
                )}
                {tab === "viewed" && room.viewingStatus === "sap_den" && (
                  <button
                    onClick={() => navigate(`/customer/viewings/${room.scheduleId}`)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Xem lịch hẹn
                  </button>
                )}
                {tab === "viewed" && ["cho_sale_ra_soat_coc", "cho_quan_ly_xac_nhan_coc", "cho_ke_toan_xac_nhan_coc"].includes(room.applicationStatus) && (
                  <span className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Yêu cầu đặt cọc đang được xử lý</span>
                )}
                {tab === "deposited" && (
                  <>
                    {room.workflowStatus === "cho_xac_nhan_ban_giao" ? (
                      <button onClick={() => navigate(`/customer/handovers/${room.id}`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        Xem biên bản bàn giao
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/customer/check-ins/NP-${room.id}${room.applicationStatus === "du_dieu_kien_nhan_phong" ? "?profileApproved=true" : ""}`)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        {room.applicationStatus === "du_dieu_kien_nhan_phong" ? "Xem và ký hợp đồng" : "Bổ sung thông tin"}
                      </button>
                    )}
                    <button onClick={() => navigate(`/customer/deposit-refunds/${room.id}`)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Yêu cầu hoàn cọc
                    </button>
                  </>
                )}
                {tab === "renting" && room.workflowStatus === "cho_khach_xac_nhan" && (
                  <button onClick={() => navigate(`/customer/checkouts/${room.id}/reconciliation`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Xác nhận hiện trạng và đối soát
                  </button>
                )}
                {tab === "renting" && room.workflowStatus !== "cho_khach_xac_nhan" && (
                  <button onClick={() => navigate(`/customer/checkouts/${room.id}/request`)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
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

export function DepositRefundRequest() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [detail, setDetail] = useState<CustomerRoomContext | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    customerWorkflowService
      .getRoomContext(roomId)
      .then(setDetail)
      .catch((requestError) => setError(requestError.message));
  }, [roomId]);

  const canSubmit = Boolean(detail?.depositId && detail.depositStatus === "hoan_thanh" && !detail.contractId && reason.trim());
  const submit = async () => {
    if (!roomId || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await customerWorkflowService.submitDepositRefund(roomId, reason.trim());
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể gửi yêu cầu hoàn cọc.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Yêu cầu hoàn cọc" backTo="/customer/my-rooms?tab=deposited" />
        <Section title="Yêu cầu đã được tiếp nhận">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-3 text-xl font-bold text-green-700">Gửi yêu cầu hoàn cọc thành công</h3>
            <p className="mt-2 text-gray-600">Yêu cầu đang chờ Sale tiếp nhận và chuyển sang bước đối soát.</p>
            <button onClick={() => navigate("/customer/my-rooms?tab=deposited")} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
              Quay lại phòng của tôi
            </button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Yêu cầu hoàn cọc" backTo="/customer/my-rooms?tab=deposited" />
      {error && <StatusBanner tone="amber">{error}</StatusBanner>}
      <Section title="Thông tin phiếu đặt cọc">
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <InfoRow label="Mã phiếu cọc" value={detail?.depositId ?? "Đang tải..."} />
            <InfoRow label="Khách hàng" value={detail?.customerName ?? "Đang tải..."} />
            <InfoRow label="Số điện thoại" value={detail?.phone ?? "—"} />
          </div>
          <div>
            <InfoRow label="Phòng/giường" value={detail ? `${detail.roomName} (${detail.roomId})` : "Đang tải..."} />
            <InfoRow label="Chi nhánh" value={detail?.branchName ?? "Đang tải..."} />
            <InfoRow label="Tiền cọc đã thanh toán" value={detail?.depositAmount != null ? `${detail.depositAmount.toLocaleString("vi-VN")} đ` : "—"} />
          </div>
        </div>
      </Section>
      <Section title="Nội dung yêu cầu">
        <label className="mt-5 block text-sm font-medium text-gray-700">
          Lý do yêu cầu hoàn cọc <span className="text-red-600">*</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Nhập lý do không tiếp tục thuê phòng..."
            className="mt-2 w-full rounded-lg border border-gray-300 p-3"
          />
        </label>
        {detail && (detail.depositStatus !== "hoan_thanh" || detail.contractId) && (
          <div className="mt-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> Phiếu cọc này không đủ điều kiện gửi yêu cầu hoàn cọc trực tiếp.
          </div>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/customer/my-rooms?tab=deposited")} className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700">
            Hủy
          </button>
          <button type="button" onClick={submit} disabled={!canSubmit || submitting} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:bg-gray-300">
            {submitting ? "Đang gửi..." : "Gửi yêu cầu hoàn cọc"}
          </button>
        </div>
      </Section>
    </div>
  );
}

export function ViewingAppointment() {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const [viewing, setViewing] = useState<ViewedRoom | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [rules, setRules] = useState<ResidenceRule[]>([]);
  const [services, setServices] = useState<CustomerServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [startingViewing, setStartingViewing] = useState(false);
  useEffect(() => {
    customerWorkflowService
      .getViewedRooms()
      .then(async (items) => {
        const item = items.find((entry) => entry.scheduleId === scheduleId) ?? null;
        setViewing(item);
        if (!item) return;
        const [rooms, residenceRules, serviceItems] = await Promise.all([roomService.getAll(), roomService.getResidenceRules(item.roomId), customerWorkflowService.getAvailableServices()]);
        setRoom(rooms.find((entry) => entry.roomId === item.roomId) ?? null);
        setRules(residenceRules);
        setServices(serviceItems);
      })
      .catch(() => setLoadError("Không thể tải chi tiết lịch xem phòng."))
      .finally(() => setLoading(false));
  }, [scheduleId]);
  if (loading) return <p className="text-gray-500">Đang tải lịch xem phòng...</p>;
  if (loadError) return <StatusBanner tone="amber">{loadError}</StatusBanner>;
  if (!viewing || !room) return <StatusBanner tone="amber">Không tìm thấy lịch xem phòng.</StatusBanner>;
  if (viewing.viewingStatus === "sap_den")
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="Chi tiết lịch hẹn xem phòng" backTo="/customer/my-rooms?tab=viewed" />
        <Section title="Thông tin lịch hẹn">
          <InfoRow label="Ngày giờ xem" value={new Date(viewing.viewedAt).toLocaleString("vi-VN")} />
          <InfoRow label="Phòng sẽ xem" value={room.roomName} />
          <InfoRow label="Hình thức" value={room.roomType === "ghep" ? "Giường ở ghép" : "Nguyên phòng"} />
          <InfoRow label="Chi nhánh" value={room.branchName} />
          <InfoRow label="Khu vực" value={room.area ?? "—"} />
          <InfoRow label="Trạng thái" value="Sắp đến" />
          {loadError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError}</p>}
          <button
            disabled={startingViewing}
            onClick={async () => {
              if (!scheduleId) return;
              setStartingViewing(true);
              setLoadError("");
              try {
                await customerWorkflowService.confirmRoomInformationViewed(scheduleId);
                setViewing({ ...viewing, viewingStatus: "dang_xem" });
              } catch (requestError) {
                setLoadError(requestError instanceof Error ? requestError.message : "Không thể xác nhận xem thông tin phòng.");
                setStartingViewing(false);
              }
            }}
            className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:bg-gray-300"
          >
            {startingViewing ? "Đang xác nhận..." : "Xác nhận xem phòng"}
          </button>
        </Section>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={viewing.viewingStatus === "hoan_thanh" ? "Phòng đã xem" : "Phòng đang xem"} backTo="/customer/my-rooms?tab=viewed" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={`${room.roomName} — ${room.branchName}`}>
          <InfoRow label="Hình thức" value={room.roomType === "ghep" ? "Thuê giường ở ghép" : "Thuê nguyên phòng"} />
          <InfoRow label="Giá thuê" value={`${viewing.monthlyRent.toLocaleString("vi-VN")} đ/tháng`} />
          <InfoRow label="Sức chứa tối đa" value={`${room.capacity} người`} />
          <InfoRow label="Khu vực" value={room.area ?? "—"} />
          <InfoRow label="Điều hòa" value={room.hasAirConditioner ? "Có" : "Không"} />
          <InfoRow label="Gửi xe" value={room.hasParking ? "Có" : "Không"} />
        </Section>
        <Section title="Đặt cọc và giữ phòng">
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800">
            <strong>Cọc dự kiến: {(viewing.monthlyRent * 2).toLocaleString("vi-VN")} đ</strong>
          </div>
        </Section>
      </div>
      <Section title="Chi phí điện, nước và dịch vụ đi kèm">
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 text-sm font-semibold">
            <span>Dịch vụ</span>
            <span>Đơn vị</span>
            <span className="text-right">Đơn giá</span>
          </div>
          {services.map((item) => (
            <div key={item.serviceId} className="grid grid-cols-3 border-t px-4 py-3 text-sm">
              <span>{item.serviceName}</span>
              <span>{item.unit}</span>
              <span className="text-right">{item.unitPrice.toLocaleString("vi-VN")} đ</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Nội quy và quy định lưu trú">
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.residenceRuleId} className="rounded-lg bg-gray-50 p-4 text-sm">
              <strong>{rule.title}</strong>
              <p className="mt-1 text-gray-600">{rule.content}</p>
            </div>
          ))}
        </div>
        {viewing.viewingStatus === "hoan_thanh" ? (
          <button onClick={() => navigate(`/customer/deposit-requests/${viewing.applicationId}__${viewing.roomId}`)} className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">
            Yêu cầu đặt cọc
          </button>
        ) : (
          <button disabled className="mt-5 w-full rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-500">
            Chờ Sale xác nhận hoàn thành xem phòng
          </button>
        )}
      </Section>
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

  const submitDeposit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await customerWorkflowService.submitDepositRequest(applicationId, roomId);
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
      <div className="grid gap-6 lg:grid-cols-3">
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
          <button type="button" onClick={submitDeposit} disabled={submitting} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white disabled:bg-gray-300">
            {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt cọc"}
          </button>
        </Section>
      </div>
    </div>
  );
}

export function DepositTermsConfirmation() {
  const { depositTermsId } = useParams();
  const [applicationId, roomId] = (depositTermsId ?? "").split("__");
  const [viewedRoom, setViewedRoom] = useState<ViewedRoom | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [rules, setRules] = useState<ResidenceRule[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!applicationId || !roomId) {
      setError("Đường dẫn xác nhận điều kiện thuê không hợp lệ.");
      setLoading(false);
      return;
    }

    Promise.all([customerWorkflowService.getDepositTerms(applicationId, roomId), roomService.getAll(), roomService.getResidenceRules(roomId)])
      .then(([depositTerms, rooms, residenceRules]) => {
        setViewedRoom(depositTerms);
        setRoom(rooms.find((item) => item.roomId === roomId) ?? null);
        setRules(residenceRules);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Không thể tải điều kiện thuê và nội quy."))
      .finally(() => setLoading(false));
  }, [applicationId, roomId]);

  const confirmTerms = async () => {
    setSubmitting(true);
    setError("");
    try {
      await customerWorkflowService.confirmDepositTerms(applicationId, roomId);
      setConfirmed(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể xác nhận điều kiện thuê.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-600">Đang tải điều kiện thuê và nội quy...</p>;

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="Xác nhận điều kiện thuê" backTo="/customer/my-rooms?tab=viewed" />
        <Section title="Đã xác nhận">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h3 className="mt-3 text-xl font-bold">Đã đồng ý điều kiện thuê và nội quy</h3>
            <p className="mt-2 text-gray-600">Hồ sơ đã được chuyển sang bộ phận Kế toán để tính tiền cọc và lập yêu cầu thanh toán.</p>
          </div>
        </Section>
      </div>
    );
  }

  if (!viewedRoom || !room) {
    return (
      <div className="space-y-6">
        <PageHeader title="Xác nhận điều kiện thuê" backTo="/customer/my-rooms?tab=viewed" />
        <StatusBanner tone="amber">{error || "Không tìm thấy thông tin phòng cần xác nhận."}</StatusBanner>
      </div>
    );
  }

  const applicant = viewedRoom.applicant;
  const allowedGender = room.allowedGender === "nam" ? "Nam" : room.allowedGender === "nu" ? "Nữ" : "Không giới hạn";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Xác nhận điều kiện thuê và nội quy" backTo="/customer/my-rooms?tab=viewed" />
      {error && <StatusBanner tone="amber">{error}</StatusBanner>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Điều khoản thuê được xác nhận">
          <InfoRow label="Phòng/giường" value={`${viewedRoom.roomName}${viewedRoom.bedNumber ? ` - Giường ${viewedRoom.bedNumber}` : " - Nguyên phòng"}`} />
          <InfoRow label="Chi nhánh" value={viewedRoom.branchName} />
          <InfoRow label="Tình trạng chỗ thuê" value={room.status === "trong" ? "Còn trống - Quản lý đã xác nhận" : room.status} />
          <InfoRow label="Hình thức thuê" value={viewedRoom.roomType === "ghep" ? "Thuê giường ở ghép" : "Thuê nguyên phòng"} />
          <InfoRow label="Giá thuê" value={`${viewedRoom.monthlyRent.toLocaleString("vi-VN")} đ/tháng`} />
          <InfoRow label="Ngày dự kiến vào" value={applicant.expectedMoveInDate ? new Date(applicant.expectedMoveInDate).toLocaleDateString("vi-VN") : "-"} />
          <InfoRow label="Thời hạn thuê" value={applicant.expectedRentalMonths ? `${applicant.expectedRentalMonths} tháng` : "-"} />
          <InfoRow label="Giờ giới nghiêm" value={room.curfewTime || "Theo nội quy chi nhánh"} />
        </Section>
        <Section title="Kết quả rà soát điều kiện lưu trú">
          <InfoRow label="Người đăng ký" value={applicant.fullName} />
          <InfoRow label="Sức chứa" value={`${applicant.numberOfPeople}/${room.capacity} người - Phù hợp`} />
          <InfoRow label="Giới tính" value={`${applicant.gender || "-"} / Phòng: ${allowedGender} - Phù hợp`} />
          <InfoRow label="Quốc tịch" value={`${applicant.nationality || "-"} - Đã rà soát`} />
          <InfoRow label="Giấy tờ" value={`${applicant.documentType || "-"}${applicant.documentNumber ? ` - ${applicant.documentNumber}` : ""} - Đã có thông tin`} />
          <InfoRow label="Khả năng tài chính" value={applicant.financialDocumentUrl ? "Đã có tài liệu" : "Không yêu cầu tài liệu"} />
          <InfoRow label="Yêu cầu yên tĩnh" value={!room.requiresQuietLifestyle || applicant.requiresQuietLifestyle ? "Phù hợp" : "Cần trao đổi lại"} />
          <InfoRow label="Gửi xe" value={applicant.requiresParking ? (room.hasParking ? "Đáp ứng" : "Không đáp ứng") : "Không yêu cầu"} />
          <InfoRow label="Điều hòa" value={applicant.requiresAirConditioner ? (room.hasAirConditioner ? "Đáp ứng" : "Không đáp ứng") : "Không yêu cầu"} />
        </Section>
      </div>
      <Section title="Nội quy ký túc xá">
        {rules.length > 0 ? (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.residenceRuleId} className="rounded-lg bg-gray-50 p-4 text-sm">
                <strong className="text-gray-900">{rule.title}</strong>
                <p className="mt-1 leading-6 text-gray-600">{rule.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có nội quy đang áp dụng cho chi nhánh này.</p>
        )}
        <button
          type="button"
          onClick={confirmTerms}
          disabled={submitting}
          className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? "Đang xác nhận..." : "Xác nhận điều kiện thuê và nội quy"}
        </button>
      </Section>
    </div>
  );
}

function PaymentPage({ kind }: { kind: "deposit" | "checkin" }) {
  const navigate = useNavigate();
  const params = useParams();
  const [paid, setPaid] = useState(false);
  const isDeposit = kind === "deposit";
  const rawReference = params.paymentRequestId ?? "";
  const paymentRoomId = rawReference.replace(/^(TT|DT)-/, "");
  const [paymentContext, setPaymentContext] = useState<CustomerRoomContext | null>(null);
  useEffect(() => {
    if (paymentRoomId) customerWorkflowService.getRoomContext(paymentRoomId).then(setPaymentContext);
  }, [paymentRoomId]);
  const paymentAmount = paymentContext?.invoiceAmount ?? paymentContext?.depositAmount ?? 0;
  const amount = `${paymentAmount.toLocaleString("vi-VN")} đ`;
  const transferContent = isDeposit ? `DAT COC ${paymentContext?.roomId ?? paymentRoomId}` : `NHAN PHONG ${paymentContext?.roomId ?? paymentRoomId}`;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={isDeposit ? "Thanh toán tiền cọc" : "Thanh toán khoản nhận phòng"} backTo={isDeposit ? "/customer/my-rooms?tab=viewed" : "/customer/my-rooms?tab=deposited"} />
      {paid ? (
        <Section title="Kết quả thanh toán">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-3 text-xl font-bold text-green-700">Thanh toán thành công</h3>
            <p className="mt-2 text-gray-600">Khoản thanh toán đã được xác nhận.</p>
            <button
              onClick={() => navigate(isDeposit ? "/customer/my-rooms?tab=deposited" : "/customer/handovers/PHONG_18")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white"
            >
              Tiếp tục
            </button>
          </div>
        </Section>
      ) : (
        <>
          <Section title="Chi tiết khoản thu">
            <InfoRow label="Loại khoản thu" value={isDeposit ? "Tiền cọc" : "Tiền thuê kỳ đầu và dịch vụ"} />
            <InfoRow label="Phòng/giường" value={`${paymentContext?.roomName ?? "Đang tải..."} - ${paymentContext?.roomType === "ghep" ? "Ở ghép" : "Nguyên phòng"}`} />
            <InfoRow label="Số tiền" value={amount} />
            <InfoRow label="Hạn thanh toán" value="23:59 ngày 12/07/2026" />
          </Section>
          <Section title="Quét QR để thanh toán">
            <PaymentQrPanel amount={paymentAmount} transferContent={transferContent} onConfirm={() => setPaid(true)} />
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
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [params] = useSearchParams();
  const profileApproved = params.get("profileApproved") === "true";
  const [showContract, setShowContract] = useState(profileApproved);
  const [signatureName, setSignatureName] = useState("");
  const [residenceRules, setResidenceRules] = useState<ResidenceRule[]>([]);
  const { checkInId } = useParams();
  const contractRoomId = (checkInId ?? "").replace(/^NP-/, "");
  const [contractDetail, setContractDetail] = useState<CustomerContractDetail | null>(null);
  const [checkInContext, setCheckInContext] = useState<CustomerRoomContext | null>(null);
  useEffect(() => {
    if (!contractRoomId) return;
    Promise.all([roomService.getResidenceRules(contractRoomId), customerWorkflowService.getRoomContext(contractRoomId)])
      .then(([rules, context]) => {
        setResidenceRules(rules);
        setCheckInContext(context);
      })
      .catch(() => setResidenceRules([]));
    customerWorkflowService
      .getContractDetail(contractRoomId)
      .then(setContractDetail)
      .catch(() => setContractDetail(null));
  }, [contractRoomId]);
  if (showContract)
    return (
      <div className="space-y-6">
        <PageHeader title="Xem và ký hợp đồng" backTo="/customer/my-rooms?tab=deposited" />
        <Section title="Hợp đồng thuê">
          <div className="space-y-5 rounded-lg bg-gray-50 p-5 text-sm leading-6 text-gray-700">
            <h3 className="text-center text-lg font-bold">HỢP ĐỒNG THUÊ CHỖ Ở</h3>
            <div>
              <h4 className="font-bold text-gray-900">1. Thông tin các bên</h4>
              <p>Bên cho thuê: HomeStay Dorm - {contractDetail?.branchName ?? "Đang tải..."}.</p>
              <p>Bên thuê: {contractDetail?.customerName ?? "Đang tải..."}. Danh sách người ở kèm theo lấy từ hồ sơ đã được Quản lý xác nhận.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">2. Phòng/giường và thời hạn thuê</h4>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <p>
                  Phòng thuê: <strong>{contractDetail?.roomName ?? "Đang tải..."}</strong>
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
                Giá thuê: <strong>{(contractDetail?.monthlyRent ?? 0).toLocaleString("vi-VN")} đồng/tháng</strong>.
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
              {residenceRules.length === 0 ? (
                <p className="text-gray-500">Đang tải nội quy của chi nhánh...</p>
              ) : (
                <ul className="space-y-2">
                  {residenceRules.map((rule) => (
                    <li key={rule.residenceRuleId}>
                      <strong>{rule.title}:</strong> {rule.content}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">7. Xử lý vi phạm</h4>
              <ul className="space-y-1">
                {residenceRules.map((rule) => (
                  <li key={rule.residenceRuleId}>
                    {rule.title}:{" "}
                    {rule.violationLevel === "nhac_nho"
                      ? "Nhắc nhở"
                      : rule.violationLevel === "boi_thuong"
                        ? "Bồi thường theo thiệt hại thực tế"
                        : `Khấu trừ cọc${rule.defaultPenaltyAmount ? ` ${rule.defaultPenaltyAmount.toLocaleString("vi-VN")} đồng` : ""}`}
                    .
                  </li>
                ))}
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
          <button
            disabled={!signatureName.trim()}
            onClick={() => navigate(`/customer/check-in-payments/TT-${contractRoomId}`)}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:bg-gray-300"
          >
            {contractDetail?.contractStatus === "cho_ky" ? "Ký hợp đồng" : "Tiếp tục thanh toán"}
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
                {(checkInContext?.tenants.length
                  ? checkInContext.tenants
                  : [
                      {
                        fullName: checkInContext?.customerName ?? "",
                        gender: checkInContext?.gender,
                        nationality: checkInContext?.nationality,
                        dateOfBirth: checkInContext?.dateOfBirth,
                        nationalId: checkInContext?.nationalId,
                        documentImageUrl: null,
                        permanentAddress: checkInContext?.address,
                        occupationOrSchool: null,
                      },
                    ]
                ).map((tenant, index) => (
                  <tr key={index} className="border-t align-top">
                    <td className="p-2">
                      <input required defaultValue={tenant.fullName} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <select required className="w-full rounded border px-2 py-2">
                        <option>Nữ</option>
                        <option>Nam</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input required defaultValue={tenant.nationality ?? "Việt Nam"} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required type="date" defaultValue={tenant.dateOfBirth ?? ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={tenant.nationalId ?? ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      {tenant.documentImageUrl && <span className="mb-1 block text-xs text-gray-500">Đã có: {tenant.documentImageUrl}</span>}
                      <input required={!tenant.documentImageUrl} type="file" accept="image/*" className="w-full text-xs" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={tenant.permanentAddress ?? ""} className="w-full rounded border px-2 py-2" />
                    </td>
                    <td className="p-2">
                      <input required defaultValue={tenant.occupationOrSchool ?? ""} className="w-full rounded border px-2 py-2" />
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
  const { handoverId: roomId } = useParams();
  const [detail, setDetail] = useState<CustomerHandoverDetail | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (roomId) customerWorkflowService.getHandoverDetail(roomId).then(setDetail);
  }, [roomId]);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Biên bản bàn giao" backTo="/customer/my-rooms?tab=deposited" />
      <Section title={detail ? `${detail.roomName} — ${detail.handoverId}` : "Đang tải biên bản..."}>
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <InfoRow label="Hợp đồng" value={detail?.contractId ?? "—"} />
            <InfoRow label="Quản lý bàn giao" value={detail?.managerName ?? "—"} />
            <InfoRow label="Ngày bàn giao" value={detail?.handoverDate ? new Date(detail.handoverDate).toLocaleDateString("vi-VN") : "—"} />
          </div>
          <div>
            <InfoRow label="Hiện trạng" value={detail?.roomCondition ?? "—"} />
            <InfoRow label="Điện đầu kỳ" value={`${(detail?.initialElectricityReading ?? 0).toLocaleString("vi-VN")} kWh`} />
            <InfoRow label="Nước đầu kỳ" value={`${(detail?.initialWaterReading ?? 0).toLocaleString("vi-VN")} m³`} />
          </div>
        </div>
        <h3 className="mb-3 mt-5 font-semibold text-gray-900">Tài sản bàn giao</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {(detail?.assets ?? []).map((asset) => (
            <div key={asset.assetId} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm">
              <span>
                <strong>{asset.assetName}</strong>: {asset.quantity} — {asset.condition === "tot" ? "Tốt" : asset.condition}
              </span>
            </div>
          ))}
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button
          disabled={!detail || confirming}
          onClick={async () => {
            if (!roomId) return;
            setConfirming(true);
            setError("");
            try {
              await customerWorkflowService.confirmHandover(roomId);
              navigate("/customer/my-rooms?tab=renting");
            } catch (requestError) {
              setError(requestError instanceof Error ? requestError.message : "Không thể xác nhận bàn giao.");
              setConfirming(false);
            }
          }}
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          {confirming ? "Đang xác nhận..." : "Xác nhận nhận phòng"}
        </button>
      </Section>
    </div>
  );
}

export function CheckoutRequestPage() {
  const { checkoutId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CustomerCheckoutDetail | null>(null);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (checkoutId) customerWorkflowService.getCheckoutDetail(checkoutId).then(setDetail);
  }, [checkoutId]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Yêu cầu trả phòng" backTo="/customer/my-rooms?tab=renting" />
      {submitted && <StatusBanner tone="amber">Yêu cầu mẫu đã được nhập. Prototype chưa cập nhật trạng thái vào database.</StatusBanner>}
      <Section title="Thông tin hợp đồng">
        <InfoRow label="Phòng" value={detail?.roomName ?? "Đang tải..."} />
        <InfoRow label="Tên hợp đồng" value={detail ? `Hợp đồng thuê ${detail.roomName}` : "Đang tải..."} />
      </Section>
      <Section title="Lịch trả phòng đề xuất">
        <label className="block text-sm font-med	ium">
          Ngày và giờ muốn trả phòng
          <input type="datetime-local" defaultValue={detail?.requestedCheckoutAt?.slice(0, 16)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Lý do
          <textarea defaultValue={detail?.reason ?? ""} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 p-3" />
        </label>
        <div className="mt-5 flex justify-end">
          <button onClick={() => setSubmitted(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">
            Gửi yêu cầu trả phòng
          </button>
        </div>
      </Section>
    </div>
  );
}

export function CheckoutReconciliation() {
  const { checkoutId } = useParams();
  const [detail, setDetail] = useState<CustomerCheckoutDetail | null>(null);
  const [liquidationSignature, setLiquidationSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [additionalPaid, setAdditionalPaid] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (checkoutId) customerWorkflowService.getCheckoutDetail(checkoutId).then(setDetail);
  }, [checkoutId]);
  const costAmount = (type: string) => (detail?.costs ?? []).filter((cost) => cost.costType === type).reduce((sum, cost) => sum + cost.amount, 0);
  const isConfirmed = confirmed || detail?.requestStatus === "cho_hoan_tien" || detail?.contractStatus === "cho_hoan_coc" || detail?.contractStatus === "thanh_ly";
  const confirmReconciliation = async () => {
    if (!checkoutId || !liquidationSignature.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await customerWorkflowService.confirmCheckoutReconciliation(checkoutId, liquidationSignature.trim());
      setConfirmed(true);
      setDetail((current) => (current ? { ...current, reconciliationStatus: "da_xac_nhan", requestStatus: "cho_hoan_tien", contractStatus: "cho_hoan_coc" } : current));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể xác nhận đối soát.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader title="Xác nhận đối soát và thanh lý hợp đồng" backTo="/customer/my-rooms?tab=renting" />
      {error && <StatusBanner tone="amber">{error}</StatusBanner>}
      {isConfirmed && <StatusBanner tone="green">Đã xác nhận đối soát và ký thanh lý. Hồ sơ đang chờ Kế toán hoàn cọc.</StatusBanner>}
      <Section title="Biên bản hiện trạng">
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <InfoRow label="Mã biên bản" value={detail?.checkoutReportId ?? "Chưa có biên bản"} />
            <InfoRow label="Tài sản, vệ sinh và hiện trạng" value={detail?.roomCondition ?? "Chưa có biên bản"} />
            <InfoRow label="Điện cuối kỳ" value={`${detail?.finalElectricityReading ?? 0} kWh`} />
          </div>
          <div>
            <InfoRow label="Nước cuối kỳ" value={`${detail?.finalWaterReading ?? 0} m³`} />
            <InfoRow label="Chìa khóa/thẻ" value={detail?.keysReturned ? "Đã bàn giao" : "Chưa bàn giao"} />
            <InfoRow label="Chi phí hư hỏng" value={`${costAmount("hu_hong").toLocaleString("vi-VN")} đ`} />
          </div>
        </div>
      </Section>
      <Section title={`Bảng đối soát ${detail?.reconciliationId ?? ""}`}>
        <ReconciliationTable detail={detail} />
      </Section>
      <Section title="Biên bản trả phòng và thanh lý hợp đồng">
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <InfoRow label="Hợp đồng thuê" value={detail?.contractId ?? "Đang tải..."} />
            <InfoRow label="Biên bản trả phòng" value={detail?.checkoutReportId ?? "Chưa có"} />
            <InfoRow label="Phòng/giường" value={detail ? `${detail.roomName} (${detail.roomId})` : "Đang tải..."} />
            <InfoRow label="Ngày đề nghị trả phòng" value={detail?.requestedCheckoutAt ? new Date(detail.requestedCheckoutAt).toLocaleString("vi-VN") : "Chưa xác định"} />
          </div>
          <div>
            <InfoRow label="Bảng đối soát" value={detail?.reconciliationId ?? "Chưa có"} />
            <InfoRow
              label="Kết quả đối soát"
              value={
                (detail?.additionalPaymentAmount ?? 0) > 0
                  ? `Thu thêm ${(detail?.additionalPaymentAmount ?? 0).toLocaleString("vi-VN")} đ`
                  : `Hoàn ${(detail?.refundAmount ?? 0).toLocaleString("vi-VN")} đ`
              }
            />
            <InfoRow label="Công nợ sau đối soát" value={`${(detail?.additionalPaymentAmount ?? 0).toLocaleString("vi-VN")} đ`} />
            <InfoRow label="Chìa khóa/thẻ" value={detail?.keysReturned ? "Đã bàn giao" : "Chưa bàn giao"} />
            <InfoRow label="Hoàn cọc" value={(detail?.refundAmount ?? 0) > 0 ? "Kế toán hoàn sau khi khách ký thanh lý" : "Không phát sinh"} />
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-5">
          {(detail?.additionalPaymentAmount ?? 0) > 0 && (
            <div className="mb-6 space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Khoản phát sinh phải thanh toán: {(detail?.additionalPaymentAmount ?? 0).toLocaleString("vi-VN")} đ</p>
                <p className="mt-1">Quét QR và xác nhận thanh toán thành công trước khi ký biên bản thanh lý.</p>
              </div>
              <PaymentQrPanel
                amount={detail?.additionalPaymentAmount ?? 0}
                transferContent={`THU THEM ${detail?.roomId ?? checkoutId ?? ""}`}
                confirmed={additionalPaid}
                onConfirm={() => setAdditionalPaid(true)}
              />
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Nhập họ và tên người ký
            <input
              required
              value={liquidationSignature}
              onChange={(event) => setLiquidationSignature(event.target.value)}
              placeholder="Ví dụ: Nguyễn Gia Bảo"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </label>
          <button
            disabled={!liquidationSignature.trim() || submitting || isConfirmed || ((detail?.additionalPaymentAmount ?? 0) > 0 && !additionalPaid)}
            onClick={confirmReconciliation}
            className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isConfirmed
              ? "Đã xác nhận"
              : submitting
                ? "Đang xác nhận..."
                : (detail?.additionalPaymentAmount ?? 0) > 0 && !additionalPaid
                  ? "Thanh toán khoản phát sinh trước khi ký"
                  : "Xác nhận đối soát và ký thanh lý"}
          </button>
        </div>
      </Section>
    </div>
  );
}

export function CustomerNotifications() {
  const [readIds, setReadIds] = useState<string[]>(["TB03"]);
  const notifications = [
    { id: "TB01", title: "Lịch xem phòng đã được sắp xếp", message: "Bạn có lịch xem PHONG_3 lúc 09:00 ngày 14/07/2026.", time: "10 phút trước", icon: CalendarDays },
    { id: "TB02", title: "Yêu cầu đặt cọc đang được xử lý", message: "Yêu cầu của PHONG_6 đã được tiếp nhận.", time: "2 giờ trước", icon: ReceiptText },
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
