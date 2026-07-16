import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Users, Calendar, CheckCircle, X, Send, Search, ArrowRight, ArrowLeft, Building2, AlertTriangle, FileText, Sparkles, DoorOpen, FileCheck, ChevronRight, AlertCircle } from "lucide-react";
import { salesApi, type SalesApplication, type SalesDepositSlip, type SalesRentalContract } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { toast } from "sonner";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CreateDepositContract } from "./CreateDepositContract";
import { CreateRentalContract } from "./CreateRentalContract";

type MainTab = "registrations" | "deposits" | "create_deposit" | "create_contract" | "contracts" | "checkout" | "checkout_confirm" | "refund_confirm";
type RegistrationActionFilter = "schedule" | "waiting_customer_confirmation" | "confirm_viewing" | "review_deposit" | "create_deposit" | "review_checkin";
type RegistrationStageFilter = "all" | RegistrationActionFilter;

export function RegistrationManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mainTab, setMainTab] = useState<MainTab>("registrations");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    details?: ReactNode;
    confirmLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    placeholder: string;
    confirmLabel: string;
    variant: "danger" | "warning" | "info";
    value: string;
    onConfirm: (reason: string) => Promise<void> | void;
  }>({
    open: false,
    title: "",
    message: "",
    placeholder: "",
    confirmLabel: "Xác nhận",
    variant: "warning",
    value: "",
    onConfirm: () => {},
  });

  // Filters
  const [areas, setAreas] = useState<string[]>([]);

  // Search states per tab
  const [searchReg, setSearchReg] = useState("");
  const [registrationStageFilter, setRegistrationStageFilter] = useState<RegistrationStageFilter>("all");
  const [searchDeposit, setSearchDeposit] = useState("");
  const [searchContract, setSearchContract] = useState("");
  const [searchCheckout, setSearchCheckout] = useState("");

  // Modals
  const [selectedReg, setSelectedReg] = useState<SalesApplication | null>(null);
  const [selectedDepositDetail, setSelectedDepositDetail] = useState<SalesDepositSlip | null>(null);
  const [selectedRentalDetail, setSelectedRentalDetail] = useState<SalesRentalContract | null>(null);

  // Data
  const [regs, setRegs] = useState<SalesApplication[]>([]);
  const [deposits, setDeposits] = useState<SalesDepositSlip[]>([]);
  const [contracts, setContracts] = useState<SalesRentalContract[]>([]);
  const [vacantRooms, setVacantRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab === "registrations" || tab === "deposits" || tab === "create_deposit" || tab === "create_contract" || tab === "contracts" || tab === "checkout" || tab === "checkout_confirm" || tab === "refund_confirm") {
      setMainTab(tab);
    }
  }, [location.search]);

  const openReasonDialog = (config: Omit<typeof reasonDialog, "open" | "value">) => {
    setReasonDialog({ ...config, open: true, value: "" });
  };

  const submitReasonDialog = async () => {
    const reason = reasonDialog.value.trim();
    if (!reason) {
      toast.warning("Vui lòng nhập lý do trước khi xác nhận.");
      return;
    }

    await reasonDialog.onConfirm(reason);
    setReasonDialog((prev) => ({ ...prev, open: false, value: "" }));
  };



  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [applications, depositSlips, rentalContracts, roomsData] = await Promise.all([
        salesApi.getApplications().catch(() => [] as SalesApplication[]),
        salesApi.getDepositSlips().catch(() => [] as SalesDepositSlip[]),
        salesApi.getContracts().catch(() => [] as SalesRentalContract[]),
        roomService.getAll().catch(() => [] as Room[]),
      ]);
      setRegs(applications);
      setDeposits(depositSlips);
      setContracts(rentalContracts);

      const distinctAreas = Array.from(new Set(roomsData.map((r) => r.area).filter(Boolean))) as string[];
      setAreas(distinctAreas);
      setVacantRooms(roomsData.filter((r) => r.status === "trong"));
    } catch (err) {
      console.error(err);
      setError("Không thể đồng bộ dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger navigate to deposit contract page with prefilled regRef
  const triggerCreateDepositTab = (reg: SalesApplication) => {
    navigate(`/sales/deposit-contract?regRef=${reg.applicationId}`);
  };

  // Trigger navigate to rental contract page with prefilled depositRef (from deposit slip)
  const triggerCreateRentalTabFromDeposit = (dep: SalesDepositSlip) => {
    navigate(`/sales/rental-contract?depositRef=${dep.depositId}`);
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case "moi":
        return "Chờ sắp lịch";
      case "da_xem_phong":
        return "Đã xem phòng";
      case "cho_sale_ra_soat_coc":
        return "Chờ Sale rà soát cọc";
      case "cho_quan_ly_xac_nhan_coc":
        return "Chờ QL xác nhận cọc";
      case "cho_khach_thanh_toan_coc":
        return "Chờ khách thanh toán";
      case "cho_ke_toan_xac_nhan_coc":
        return "Chờ KT xác nhận cọc";
      case "da_dat_coc":
        return "Đã đặt cọc";
      case "du_dieu_kien_nhan_phong":
        return "Đủ ĐK nhận phòng";
      case "cho_sale_doi_chieu_nhan_phong":
        return "Chờ Sale đối chiếu";
      case "cho_quan_ly_duyet_nhan_phong":
        return "Chờ QL duyệt nhận phòng";
      case "dang_thue":
        return "Đang thuê";
      case "da_hoan_thanh":
        return "Đã hoàn tất";
      default:
        return st;
    }
  };

  const getDepositStatusLabel = (st: string) => {
    switch (st) {
      case "cho_thanh_toan":
        return "Chờ thanh toán";
      case "da_thanh_toan":
        return "Đã thanh toán";
      case "hoan_thanh":
        return "Hoàn thành";
      case "cho_hoan_coc":
        return "Chờ hoàn cọc";
      case "da_hoan_coc":
        return "Đã hoàn cọc";
      case "cho_tiep_nhan_hoan_coc":
        return "Chờ Sale tiếp nhận";
      case "dang_xac_nhan_hoan_coc":
        return "Chờ Quản lý xác nhận";
      case "cho_doi_soat_hoan_coc":
        return "Chờ Kế toán đối soát";
      case "cho_khach_xac_nhan_hoan_coc":
        return "Chờ khách xác nhận";
      case "cho_hoan_tien":
        return "Chờ hoàn tiền";
      case "het_han":
        return "Hết hạn";
      case "huy":
        return "Đã hủy";
      default:
        return st;
    }
  };

  const getRentalStatusLabel = (st: string) => {
    switch (st) {
      case "hieu_luc":
        return "Đang hiệu lực";
      case "cho_tra_phong":
        return "Chờ trả phòng";
      case "cho_kiem_tra_tra_phong":
        return "Chờ Quản lý kiểm tra";
      case "cho_doi_soat":
        return "Chờ đối soát";
      case "cho_khach_xac_nhan":
        return "Chờ khách xác nhận";
      case "cho_hoan_coc":
        return "Chờ hoàn/thu tiền";
      case "thanh_ly":
        return "Đã thanh lý";
      case "het_han":
        return "Hết hạn";
      default:
        return st;
    }
  };

  const getCheckoutRequestStatusLabel = (st?: string | null) => {
    switch (st) {
      case "cho_tiep_nhan":
        return "Chờ Sale xác nhận";
      case "da_xac_nhan_lich":
        return "Đã xác nhận lịch";
      case "cho_kiem_tra":
        return "Chờ kiểm tra";
      case "da_kiem_tra":
        return "Đã kiểm tra";
      case "cho_doi_soat":
        return "Chờ đối soát";
      case "cho_khach_xac_nhan":
        return "Chờ khách xác nhận";
      case "cho_hoan_tien":
        return "Chờ hoàn/thu tiền";
      case "hoan_tat":
        return "Hoàn tất";
      case "huy":
        return "Đã hủy";
      default:
        return st || "Chưa có yêu cầu";
    }
  };

  const statusColor: Record<string, string> = {
    moi: "bg-blue-100 text-blue-800 border border-blue-200",
    da_xem_phong: "bg-purple-100 text-purple-700 border border-purple-200",
    cho_sale_ra_soat_coc: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    cho_quan_ly_xac_nhan_coc: "bg-orange-100 text-orange-800 border border-orange-200",
    cho_khach_thanh_toan_coc: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    cho_ke_toan_xac_nhan_coc: "bg-amber-100 text-amber-800 border border-amber-200",
    cho_sale_doi_chieu_nhan_phong: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    cho_quan_ly_duyet_nhan_phong: "bg-violet-100 text-violet-800 border border-violet-200",
    da_dat_coc: "bg-green-100 text-green-700 border border-green-200",
    du_dieu_kien_nhan_phong: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dang_thue: "bg-teal-100 text-teal-700 border border-teal-200",
    da_hoan_thanh: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  // ── Filtered lists ──
  const hasActiveDeposit = (applicationId: string) => deposits.some((deposit) => deposit.applicationId === applicationId && deposit.status !== "huy" && deposit.status !== "het_han");

  const isDepositOverdue = (deposit: SalesDepositSlip) =>
    deposit.status === "cho_thanh_toan"
    && deposit.applicationStatus === "cho_khach_thanh_toan_coc"
    && !deposit.hasPaymentProof
    && new Date(deposit.holdUntil).getTime() < Date.now();

  const getDepositWorkflowLabel = (deposit: SalesDepositSlip) => {
    if (deposit.applicationStatus === "cho_khach_thanh_toan_coc" && !deposit.hasPaymentProof) return "Chờ khách thanh toán";
    if (deposit.applicationStatus === "cho_ke_toan_xac_nhan_coc" && deposit.hasPaymentProof) return "Chờ Kế toán xác nhận";
    return getDepositStatusLabel(deposit.status);
  };

  const getApplicationForDeposit = (deposit: SalesDepositSlip) => regs.find((reg) => reg.applicationId === deposit.applicationId);

  const canCreateRentalFromDeposit = (deposit: SalesDepositSlip) => {
    const application = getApplicationForDeposit(deposit);
    return deposit.status === "hoan_thanh" && !deposit.hasContract && application?.status === "du_dieu_kien_nhan_phong" && !application.hasContract;
  };

  const getRegistrationActionFilter = (reg: SalesApplication): RegistrationActionFilter | null => {
    if (reg.status === "moi" && !reg.appointmentSent) return "schedule";
    if (reg.status === "moi" && reg.appointmentSent && reg.scheduleId && reg.scheduleStatus === "sap_den") return "waiting_customer_confirmation";
    if (reg.status === "moi" && reg.appointmentSent && reg.scheduleId && reg.scheduleStatus === "dang_xem") return "confirm_viewing";
    if (reg.status === "cho_sale_ra_soat_coc") return "review_deposit";
    if (reg.status === "cho_khach_thanh_toan_coc" && !reg.hasContract && !hasActiveDeposit(reg.applicationId)) return "create_deposit";
    if (reg.status === "cho_sale_doi_chieu_nhan_phong") return "review_checkin";
    return null;
  };

  const getRoomCompatibility = (reg: SalesApplication, room: Room) => {
    const roomPrice = room.roomPrice ?? 0;
    const availableCapacity = room.roomType === "ghep"
      ? room.beds.filter(bed => bed.status === "trong").length
      : room.capacity;
    const genderMatches =
      !reg.gender ||
      !room.allowedGender ||
      room.allowedGender.toLowerCase() === "khong_gioi_han" ||
      (reg.gender === "Nam" && room.allowedGender.toLowerCase() === "nam") ||
      (reg.gender === "Nữ" && room.allowedGender.toLowerCase() === "nu");
    const priceMatches =
      (reg.minimumPrice == null || roomPrice >= reg.minimumPrice) &&
      (reg.maximumPrice == null || roomPrice <= reg.maximumPrice);

    return [
      {
        label: "Trạng thái phòng",
        req: "Còn trống",
        roomVal: room.status === "trong" ? "Còn trống" : room.status,
        match: room.status === "trong",
      },
      {
        label: "Khu vực",
        req: reg.area || "Không yêu cầu",
        roomVal: `${room.branchName}${room.area ? ` · ${room.area}` : ""}`,
        match:
          !reg.area ||
          reg.area.toLowerCase() === room.area?.toLowerCase() ||
          room.branchName.toLowerCase().includes(reg.area.toLowerCase()),
      },
      {
        label: "Loại phòng",
        req: reg.desiredRoomType === "ghep" ? "Phòng ghép" : reg.desiredRoomType === "nguyen_can" ? "Nguyên căn" : "Không yêu cầu",
        roomVal: room.roomType === "ghep" ? "Phòng ghép" : "Nguyên căn",
        match: !reg.desiredRoomType || reg.desiredRoomType === room.roomType,
      },
      {
        label: "Giới tính khách / Phòng cho phép",
        req: reg.gender || "Không yêu cầu",
        roomVal: room.allowedGender === "nam" ? "Nam" : room.allowedGender === "nu" ? "Nữ" : "Không giới hạn",
        match: genderMatches,
      },
      {
        label: room.roomType === "ghep" ? "Giường trống" : "Sức chứa tối đa",
        req: `${reg.capacity} người`,
        roomVal: `${availableCapacity} chỗ`,
        match: reg.capacity <= availableCapacity,
      },
      {
        label: "Mức giá",
        req: reg.priceRange,
        roomVal: `${roomPrice.toLocaleString("vi-VN")} đ`,
        match: priceMatches,
      },
      {
        label: "Không gian yên tĩnh",
        req: reg.requiresQuietLifestyle ? "Bắt buộc" : "Không yêu cầu",
        roomVal: room.requiresQuietLifestyle ? "Có" : "Không",
        match: !reg.requiresQuietLifestyle || room.requiresQuietLifestyle,
      },
      {
        label: "Chỗ gửi xe",
        req: reg.requiresParking ? "Bắt buộc" : "Không yêu cầu",
        roomVal: room.hasParking ? "Có" : "Không",
        match: !reg.requiresParking || room.hasParking,
      },
      {
        label: "Điều hòa",
        req: reg.requiresAirConditioner ? "Bắt buộc" : "Không yêu cầu",
        roomVal: room.hasAirConditioner ? "Có" : "Không",
        match: !reg.requiresAirConditioner || room.hasAirConditioner,
      },
    ];
  };
  const needsSalesRegistrationAction = (reg: SalesApplication) => {
    const action = getRegistrationActionFilter(reg);
    return action !== null && action !== "create_deposit" && action !== "waiting_customer_confirmation";
  };
  const needsSalesRefundDepositAction = (deposit: SalesDepositSlip) => deposit.status === "cho_tiep_nhan_hoan_coc" && !deposit.hasContract;
  const needsSalesDepositAction = (deposit: SalesDepositSlip) => deposit.status === "het_han" || isDepositOverdue(deposit);
  const needsSalesCheckoutContractAction = (contract: SalesRentalContract) =>
    contract.status === "cho_tra_phong" && contract.checkoutRequest?.status === "cho_tiep_nhan";
  const actionableRegs = regs.filter(needsSalesRegistrationAction);
  // Phiếu đã lập thuộc bước thanh toán của Khách hàng hoặc đối chiếu của Kế toán.
  // Sale chỉ xử lý hồ sơ chưa có phiếu tại nhóm PHONG_44 bên dưới.
  const actionableDeposits: SalesDepositSlip[] = [];
  const actionableRefundDeposits = deposits.filter(needsSalesRefundDepositAction);
  const actionableCheckoutContracts = contracts.filter(needsSalesCheckoutContractAction);

  const renderDepositReviewDetails = (reg: SalesApplication) => {
    const room = vacantRooms.find((item) => item.roomId === reg.roomId);
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["Mã hồ sơ", reg.applicationId],
            ["Khách hàng", reg.customerName],
            ["Số điện thoại", reg.phoneNumber],
            ["Email", reg.email || "Chưa có"],
            ["Phòng đề xuất", reg.roomName || "Chưa chọn phòng"],
            ["Khu vực", room?.area ?? reg.area ?? "Chưa rõ"],
            ["Sức chứa yêu cầu", `${reg.capacity} người`],
            ["Giới tính", reg.gender || "Chưa rõ"],
            ["Mức giá mong muốn", reg.priceRange || "Chưa rõ"],
            ["Ngày đăng ký", new Date(reg.createdAt).toLocaleDateString("vi-VN")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase text-gray-400">{label}</p>
              <p className="mt-0.5 font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {reg.appointmentAt && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
            Khách đã xem phòng theo lịch: <span className="font-semibold">{new Date(reg.appointmentAt).toLocaleString("vi-VN")}</span>
          </div>
        )}

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
          Sau khi xác nhận rà soát, hồ sơ sẽ chuyển sang Quản lý để kiểm tra phòng còn trống trước khi Sales lập phiếu đặt cọc.
        </div>
      </div>
    );
  };

  const getCheckinReviewIssues = (reg: SalesApplication) => {
    const tenants = reg.tenants ?? [];
    const issues: string[] = [];
    if (tenants.length !== reg.capacity) issues.push("Danh sách người ở chưa khớp số người đăng ký.");
    if (tenants.filter((tenant) => tenant.isPrimaryTenant).length !== 1) issues.push("Hồ sơ phải có đúng một người thuê chính.");
    if (tenants.some((tenant) => !tenant.nationalId || !tenant.documentType || !tenant.documentImageUrl)) issues.push("CCCD/giấy tờ và ảnh giấy tờ chưa đầy đủ.");
    if (tenants.some((tenant) => !tenant.permanentAddress || !tenant.occupationOrSchool)) issues.push("Địa chỉ thường trú hoặc nghề nghiệp/trường học chưa đầy đủ.");
    if (tenants.some((tenant) => !tenant.isEligible)) issues.push("Có người thuê chưa đạt điều kiện lưu trú.");
    return issues;
  };

  const renderCheckinReviewDetails = (reg: SalesApplication) => {
    const tenants = reg.tenants ?? [];
    const issues = getCheckinReviewIssues(reg);
    return (
      <div className="space-y-3 text-sm">
        {issues.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="font-semibold">Chưa thể xác nhận đối chiếu:</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {issues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">Hồ sơ:</span> {reg.applicationId}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Phòng:</span> {reg.roomName}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Số người đăng ký:</span> {reg.capacity}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Số người đã khai:</span> {tenants.length || 0}
          </p>
        </div>
        {tenants.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
            Chưa có danh sách người ở trong hồ sơ. Sale cần yêu cầu khách bổ sung trước khi chuyển Quản lý duyệt.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {tenants.map((tenant, index) => (
              <div key={`${tenant.fullName}-${index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{tenant.fullName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tenant.isPrimaryTenant ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {tenant.isPrimaryTenant ? "Người đại diện" : "Thành viên"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-gray-600 sm:grid-cols-2">
                  <p>
                    Giới tính: <span className="font-medium text-gray-800">{tenant.gender ?? "Chưa rõ"}</span>
                  </p>
                  <p>
                    Quốc tịch: <span className="font-medium text-gray-800">{tenant.nationality ?? "Chưa rõ"}</span>
                  </p>
                  <p>
                    CCCD/Giấy tờ: <span className="font-medium text-gray-800">{tenant.nationalId ?? "Chưa bổ sung"}</span>
                  </p>
                  <p>
                    Loại giấy tờ: <span className="font-medium text-gray-800">{tenant.documentType ?? "Chưa rõ"}</span>
                  </p>
                  <p>
                    Ngày sinh: <span className="font-medium text-gray-800">{tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa bổ sung"}</span>
                  </p>
                  <p>
                    Nghề nghiệp/trường: <span className="font-medium text-gray-800">{tenant.occupationOrSchool ?? "Chưa bổ sung"}</span>
                  </p>
                  <p className="sm:col-span-2">
                    Địa chỉ thường trú: <span className="font-medium text-gray-800">{tenant.permanentAddress ?? "Chưa bổ sung"}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {tenants.length !== reg.capacity && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">Số người đã khai chưa khớp số người đăng ký. Kiểm tra kỹ trước khi xác nhận đối chiếu.</div>
        )}
      </div>
    );
  };

  const filteredRegs = actionableRegs.filter((r) => {
    const action = getRegistrationActionFilter(r);
    const matchesStage = registrationStageFilter === "all" || action === registrationStageFilter;
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.applicationId.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.phoneNumber.includes(searchReg) ||
      r.roomName.toLowerCase().includes(searchReg.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const filteredDeposits = actionableDeposits.filter(
    (d) =>
      d.customerName.toLowerCase().includes(searchDeposit.toLowerCase()) ||
      d.depositId.toLowerCase().includes(searchDeposit.toLowerCase()) ||
      d.phoneNumber.includes(searchDeposit) ||
      d.roomName.toLowerCase().includes(searchDeposit.toLowerCase()),
  );
  const filteredDepositCreationWork = regs.filter((reg) => getRegistrationActionFilter(reg) === "create_deposit").filter(
    (reg) =>
      reg.customerName.toLowerCase().includes(searchDeposit.toLowerCase()) ||
      reg.applicationId.toLowerCase().includes(searchDeposit.toLowerCase()) ||
      reg.phoneNumber.includes(searchDeposit) ||
      reg.roomName.toLowerCase().includes(searchDeposit.toLowerCase()),
  );
  const filteredContractWork = deposits.filter(canCreateRentalFromDeposit).filter(
    (deposit) =>
      deposit.customerName.toLowerCase().includes(searchContract.toLowerCase()) ||
      deposit.depositId.toLowerCase().includes(searchContract.toLowerCase()) ||
      deposit.phoneNumber.includes(searchContract) ||
      deposit.roomName.toLowerCase().includes(searchContract.toLowerCase()),
  );
  const filteredCheckoutContracts = actionableCheckoutContracts.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchCheckout.toLowerCase()) ||
      c.contractId.toLowerCase().includes(searchCheckout.toLowerCase()) ||
      c.phoneNumber.includes(searchCheckout) ||
      c.roomName.toLowerCase().includes(searchCheckout.toLowerCase()),
  );
  const filteredRefundDeposits = actionableRefundDeposits.filter(
    (d) =>
      d.customerName.toLowerCase().includes(searchCheckout.toLowerCase()) ||
      d.depositId.toLowerCase().includes(searchCheckout.toLowerCase()) ||
      d.phoneNumber.includes(searchCheckout) ||
      d.roomName.toLowerCase().includes(searchCheckout.toLowerCase()),
  );
  const workflowRef = new URLSearchParams(location.search).get("ref");
  const checkoutConfirmation = contracts.find((contract) => contract.contractId === workflowRef);
  const refundConfirmation = deposits.find((deposit) => deposit.depositId === workflowRef);
  const checkoutRoom = vacantRooms.find((room) => room.roomName === checkoutConfirmation?.roomName);
  const refundRoom = vacantRooms.find((room) => room.roomName === refundConfirmation?.roomName);
  const canConfirmCheckout = checkoutConfirmation?.status === "cho_tra_phong" && checkoutConfirmation.checkoutRequest?.status === "cho_tiep_nhan";
  const canAcceptRefund = refundConfirmation?.status === "cho_tiep_nhan_hoan_coc"
    && !refundConfirmation.hasContract
    && Boolean(refundConfirmation.paidAt)
    && refundConfirmation.roomStatus === "cho_hoan_coc";

  const tabConfig: { id: MainTab; label: string }[] = [
    { id: "registrations", label: "Hồ sơ đăng ký" },
    { id: "deposits", label: "Phiếu đặt cọc" },
    { id: "contracts", label: "HĐ thuê phòng" },
    { id: "create_deposit", label: "Lập phiếu đặt cọc" },
    { id: "create_contract", label: "Lập HĐ thuê" },
    { id: "checkout", label: "Trả phòng & Hoàn cọc" },
    { id: "checkout_confirm", label: "Xác nhận lịch trả phòng" },
    { id: "refund_confirm", label: "Tiếp nhận hoàn cọc" },
  ];
  const hasSelectedWork = new URLSearchParams(location.search).has("tab");
  const selectedWork = tabConfig.find((tab) => tab.id === mainTab);
  const workCards = [
    {
      label: "Hồ sơ đăng ký",
      to: "/sales/registrations?tab=registrations",
      icon: Users,
      className: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    },
    {
      label: "Phiếu đặt cọc",
      to: "/sales/registrations?tab=deposits",
      icon: FileText,
      className: "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
    },
    {
      label: "HĐ thuê phòng",
      to: "/sales/registrations?tab=contracts",
      icon: FileCheck,
      className: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    },
    {
      label: "Trả phòng & Hoàn cọc",
      to: "/sales/registrations?tab=checkout",
      icon: DoorOpen,
      className: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
    },
  ];

  if (!hasSelectedWork) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Công việc của tôi</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {workCards.map(({ label, to, icon: Icon, className }) => (
            <Link key={to} to={to} className={`bg-gradient-to-br ${className} text-white rounded-xl p-6 hover:shadow-md transition-all flex flex-col min-h-[140px] shadow-sm`}>
              <Icon className="w-8 h-8" />
              <h3 className="text-lg font-semibold mt-4 h-14">{label}</h3>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">{selectedWork?.label ?? "Công việc của tôi"}</h1>
        </div>
        <Link
          to={mainTab === "checkout_confirm" || mainTab === "refund_confirm" ? "/sales/registrations?tab=checkout" : "/sales/registrations"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> {mainTab === "checkout_confirm" || mainTab === "refund_confirm" ? "Quay lại Trả phòng & Hoàn cọc" : "Quay lại trang công việc"}
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mainTab === "registrations" && (
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchReg}
                onChange={(e) => setSearchReg(e.target.value)}
                placeholder="Tìm theo tên khách, mã đăng ký, SĐT, phòng..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
              />
            </div>
            <select
              value={registrationStageFilter}
              onChange={(e) => setRegistrationStageFilter(e.target.value as RegistrationStageFilter)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            >
              <option value="all">Tất cả lịch hồ sơ</option>
              <option value="schedule">Sắp lịch xem phòng</option>
              <option value="confirm_viewing">Xác nhận xem phòng</option>
              <option value="review_deposit">Rà soát cọc</option>
              <option value="review_checkin">Đối chiếu nhận phòng</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
              ) : filteredRegs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Không tìm thấy hồ sơ đăng ký nào</p>
                </div>
              ) : (
                filteredRegs.map((reg) => (
                  <div key={reg.applicationId} className="p-5 hover:bg-gray-50/70 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Users className="w-4.5 h-4.5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{reg.customerName}</h3>
                            <p className="text-xs text-gray-500">
                              {reg.phoneNumber} · {reg.email ?? "Không có email"}
                            </p>
                            <p className="text-xs text-gray-400"> {new Date(reg.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ml-12">
                          <div>
                            <p className="text-gray-400">Khu vực</p>
                            <p className="font-medium text-gray-800">{reg.area || "—"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Giới tính</p>
                            <p className="font-medium text-gray-800">{reg.gender || "—"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Sức chứa</p>
                            <p className="font-medium text-gray-800">{reg.capacity} người</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Phòng</p>
                            <p className="font-medium text-gray-800 truncate">{reg.roomName}</p>
                          </div>
                        </div>
                        {reg.appointmentAt && (
                          <div className="mt-2 ml-12 flex items-center gap-1 text-xs text-green-700 font-medium">
                            <Calendar className="w-3 h-3" /> Lịch hẹn: {new Date(reg.appointmentAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {/* Action: Sắp lịch xem phòng */}
                        {reg.status === "moi" && !reg.appointmentSent && (
                          <button
                            onClick={() => navigate(`/sales/assign-room?regRef=${reg.applicationId}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                          >
                            <ArrowRight className="w-3 h-3" /> Sắp lịch xem phòng
                          </button>
                        )}

                        {reg.status === "moi" && reg.scheduleStatus === "sap_den" && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                            <Calendar className="h-3 w-3" /> Chờ khách xác nhận
                          </span>
                        )}

                        {/* Chỉ xác nhận đã xem sau khi khách chuyển lịch sang dang_xem */}
                        {reg.status === "moi" && reg.scheduleStatus === "dang_xem" && reg.scheduleId && (
                            <button
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  title: "Xác nhận xem phòng",
                                  message: "Xác nhận khách hàng đã xem phòng xong?",
                                  onConfirm: async () => {
                                    setConfirmDialog((prev) => ({ ...prev, open: false }));
                                    try {
                                      await salesApi.completeSchedule(reg.scheduleId!);
                                      toast.success("Đã ghi nhận kết quả xem phòng.");
                                      await loadData();
                                    } catch {
                                      toast.error("Không thể xác nhận kết quả xem phòng.");
                                    }
                                  },
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                              <CheckCircle className="w-3 h-3" /> Xác nhận đã xem
                            </button>
                        )}

                        {/* Action: Rà soát cọc */}
                        {reg.status === "cho_sale_ra_soat_coc" && (
                          <>
                            <button
                              onClick={() => navigate(`/sales/review-deposit?regRef=${reg.applicationId}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                              <FileCheck className="w-3 h-3" /> Rà soát cọc
                            </button>
                          </>
                        )}

                        {getRegistrationActionFilter(reg) === "create_deposit" && (
                          <button
                            onClick={() => triggerCreateDepositTab(reg)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                          >
                            <Sparkles className="w-3 h-3" /> Lập phiếu đặt cọc
                          </button>
                        )}

                        {/* Action: Đối chiếu nhận phòng */}
                        {reg.status === "cho_sale_doi_chieu_nhan_phong" && (
                          <>
                            <button
                              onClick={() => navigate(`/sales/review-checkin?regRef=${reg.applicationId}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                              <FileCheck className="w-3 h-3" /> Đối chiếu nhận phòng
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === "create_deposit" && <CreateDepositContract />}

      {mainTab === "create_contract" && <CreateRentalContract />}

      {mainTab === "deposits" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchDeposit}
              onChange={(e) => setSearchDeposit(e.target.value)}
              placeholder="Tìm phiếu cọc theo tên khách, mã phiếu, phòng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>

          {filteredDepositCreationWork.length > 0 && (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="border-b border-purple-100 bg-purple-50/60 px-5 py-3">
                <h3 className="text-sm font-bold text-purple-900">Hồ sơ chờ Sale lập phiếu đặt cọc</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã hồ sơ</th>
                      <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                      <th className="px-5 py-3.5 font-bold">Phòng</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDepositCreationWork.map((reg) => (
                      <tr key={reg.applicationId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">{reg.applicationId}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{reg.customerName}</p>
                          <p className="text-xs text-gray-500">{reg.phoneNumber}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{reg.roomName}</p>
                          <p className="text-xs text-gray-500">{reg.area}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-purple-200 bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">Chờ lập phiếu cọc</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => triggerCreateDepositTab(reg)} className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-purple-700">
                            <Sparkles className="h-3 w-3" /> Lập phiếu đặt cọc
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredDeposits.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : filteredDeposits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không có phiếu đặt cọc nào cần Sales xử lý</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã phiếu cọc</th>
                      <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                      <th className="px-5 py-3.5 font-bold">Phòng</th>
                      <th className="px-5 py-3.5 font-bold">Số tiền cọc</th>
                      <th className="px-5 py-3.5 font-bold">Giữ đến</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDeposits.map((d) => (
                      <tr key={d.depositId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-gray-700 font-bold">{d.depositId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{d.customerName}</p>
                          <p className="text-xs text-gray-500">{d.phoneNumber}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{d.roomName}</p>
                          <p className="text-xs text-gray-500">{d.area}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">{d.depositAmount.toLocaleString("vi-VN")} đ</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{new Date(d.holdUntil).toLocaleDateString("vi-VN")}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              d.status === "hoan_thanh"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : d.status === "cho_thanh_toan"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : d.status === "da_thanh_toan"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : d.status === "cho_hoan_coc"
                                      ? "bg-orange-100 text-orange-800 border-orange-200"
                                      : d.status === "da_hoan_coc"
                                        ? "bg-gray-100 text-gray-600 border-gray-200"
                                        : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {getDepositWorkflowLabel(d)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* ── TAB: HỢP ĐỒNG THUÊ ── */}
      {mainTab === "contracts" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchContract}
              onChange={(e) => setSearchContract(e.target.value)}
              placeholder="Tìm hồ sơ lập hợp đồng theo tên khách, mã phiếu cọc, phòng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : filteredContractWork.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không có hồ sơ nào cần Sale lập hợp đồng thuê</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã phiếu cọc</th>
                      <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                      <th className="px-5 py-3.5 font-bold">Phòng</th>
                      <th className="px-5 py-3.5 font-bold">Tiền cọc</th>
                      <th className="px-5 py-3.5 font-bold">Hạn giữ chỗ</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContractWork.map((deposit) => (
                      <tr key={deposit.depositId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-gray-700 font-bold">{deposit.depositId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{deposit.customerName}</p>
                          <p className="text-xs text-gray-500">{deposit.phoneNumber}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{deposit.roomName}</p>
                          <p className="text-xs text-gray-500">{deposit.area}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">{deposit.depositAmount.toLocaleString("vi-VN")} đ</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{new Date(deposit.holdUntil).toLocaleDateString("vi-VN")}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">Đủ điều kiện lập HĐ</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => triggerCreateRentalTabFromDeposit(deposit)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Lập HĐ thuê
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: TRẢ PHÒNG & HOÀN CỌC ── */}
      {mainTab === "checkout" && (
        <div className="space-y-4">
          {/* Trả phòng section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" /> Trả phòng
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {filteredCheckoutContracts.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <DoorOpen className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs">Không có yêu cầu trả phòng nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">Mã HĐ thuê</th>
                        <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                        <th className="px-5 py-3.5 font-bold">Phòng</th>
                        <th className="px-5 py-3.5 font-bold">Ngày trả dự kiến</th>
                        <th className="px-5 py-3.5 font-bold">Trạng thái trả phòng</th>
                        <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCheckoutContracts.map((c) => (
                        <tr key={c.contractId} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-gray-700">{c.contractId}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{c.customerName}</p>
                            <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-800">{c.roomName}</td>
                          <td className="px-5 py-4 text-xs text-gray-600">{c.checkoutRequest ? new Date(c.checkoutRequest.expectedDate).toLocaleDateString("vi-VN") : "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                  c.checkoutRequest?.status === "cho_tiep_nhan" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                              >
                                {getCheckoutRequestStatusLabel(c.checkoutRequest?.status)}
                              </span>
                              <span className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                <DoorOpen className="w-2.5 h-2.5" /> Trả phòng
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {c.checkoutRequest?.status === "cho_tiep_nhan" && (
                                <button
                                  onClick={() => navigate(`/sales/registrations?tab=checkout_confirm&ref=${encodeURIComponent(c.contractId)}`)}
                                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" /> Xác nhận lịch
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Hoàn cọc section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" /> Hoàn cọc
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {filteredRefundDeposits.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs">Không có yêu cầu hoàn cọc nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">Mã phiếu cọc</th>
                        <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                        <th className="px-5 py-3.5 font-bold">Phòng</th>
                        <th className="px-5 py-3.5 font-bold">Số tiền cọc</th>
                        <th className="px-5 py-3.5 font-bold">Lý do hoàn</th>
                        <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                        <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRefundDeposits.map((d) => (
                        <tr key={d.depositId} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-gray-700">{d.depositId}</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{d.customerName}</p>
                            <p className="text-xs text-gray-500">{d.phoneNumber}</p>
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-800">{d.roomName}</td>
                          <td className="px-5 py-4 font-bold text-gray-900">{d.depositAmount.toLocaleString("vi-VN")} đ</td>
                          <td className="px-5 py-4 text-xs text-gray-600 max-w-[180px] truncate">{d.refundReason || "—"}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-purple-100 text-purple-800 border-purple-200">{getDepositStatusLabel(d.status)}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => navigate(`/sales/registrations?tab=refund_confirm&ref=${encodeURIComponent(d.depositId)}`)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Tiếp nhận hoàn cọc
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === "checkout_confirm" && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
          {!checkoutConfirmation ? (
            <p className="text-sm text-red-600">Không tìm thấy yêu cầu trả phòng cần xác nhận.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Xác nhận lịch trả phòng</h2>
                <p className="mt-1 text-sm text-gray-500">Kiểm tra thông tin trước khi chuyển Quản lý kiểm tra phòng.</p>
              </div>
              <div className="space-y-3 rounded-xl border border-gray-200 p-5 text-sm">
                {[
                  ["Mã hợp đồng", checkoutConfirmation.contractId],
                  ["Phiếu cọc tham chiếu", checkoutConfirmation.depositRef],
                  ["Khách hàng", checkoutConfirmation.customerName],
                  ["Số điện thoại", checkoutConfirmation.phoneNumber],
                  ["Phòng", checkoutConfirmation.roomName],
                  ["Chi nhánh/khu vực", checkoutRoom ? `${checkoutRoom.branchName} - ${checkoutRoom.area ?? "Chưa rõ"}` : "Chưa cập nhật"],
                  ["Thời điểm gửi yêu cầu", checkoutConfirmation.checkoutRequest ? new Date(checkoutConfirmation.checkoutRequest.requestedCheckoutAt).toLocaleString("vi-VN") : "Chưa có"],
                  ["Ngày giờ trả dự kiến", checkoutConfirmation.checkoutRequest ? new Date(checkoutConfirmation.checkoutRequest.expectedDate).toLocaleString("vi-VN") : "Chưa có"],
                  ["Lý do/ghi chú trả phòng", checkoutConfirmation.checkoutRequest?.note || "Không có"],
                  ["Trạng thái", getCheckoutRequestStatusLabel(checkoutConfirmation.checkoutRequest?.status)],
                  ["Sau xác nhận", "Chuyển Quản lý kiểm tra phòng"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500">{label}</span><span className="text-right font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Kiểm tra điều kiện xác nhận</h3>
                <div className="space-y-2 text-sm">
                  <ConditionRow ok={checkoutConfirmation.status === "cho_tra_phong"} label="Hợp đồng đang chờ trả phòng" />
                  <ConditionRow ok={checkoutConfirmation.checkoutRequest?.status === "cho_tiep_nhan"} label="Yêu cầu đang chờ Sale tiếp nhận" />
                </div>
                {!canConfirmCheckout && <p className="mt-3 text-xs text-red-600">Không thể xác nhận vì hợp đồng hoặc yêu cầu trả phòng không còn ở đúng bước xử lý của Sale.</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/sales/registrations?tab=checkout")} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Quay lại</button>
                <button
                  onClick={async () => {
                    try {
                      await salesApi.checkoutContract(checkoutConfirmation.contractId, {
                        expectedDate: checkoutConfirmation.checkoutRequest?.expectedDate ?? new Date().toISOString(),
                        note: checkoutConfirmation.checkoutRequest?.note ?? "",
                      });
                      toast.success("Đã xác nhận lịch trả phòng. Quản lý sẽ tiếp tục kiểm tra.");
                      await loadData();
                      navigate("/sales/registrations?tab=checkout");
                    } catch { toast.error("Xác nhận lịch trả phòng thất bại."); }
                  }}
                  disabled={!canConfirmCheckout}
                  className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >Xác nhận lịch</button>
              </div>
            </div>
          )}
        </div>
      )}

      {mainTab === "refund_confirm" && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
          {!refundConfirmation ? (
            <p className="text-sm text-red-600">Không tìm thấy yêu cầu hoàn cọc cần tiếp nhận.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tiếp nhận hoàn cọc</h2>
                <p className="mt-1 text-sm text-gray-500">Kiểm tra yêu cầu trước khi chuyển Quản lý xác nhận điều kiện hoàn.</p>
              </div>
              <div className="space-y-3 rounded-xl border border-gray-200 p-5 text-sm">
                {[
                  ["Mã phiếu cọc", refundConfirmation.depositId],
                  ["Khách hàng", refundConfirmation.customerName],
                  ["Số điện thoại", refundConfirmation.phoneNumber],
                  ["Phòng", refundConfirmation.roomName],
                  ["Chi nhánh/khu vực", refundRoom ? `${refundRoom.branchName} - ${refundConfirmation.area}` : refundConfirmation.area],
                  ["Số tiền cọc", `${refundConfirmation.depositAmount.toLocaleString("vi-VN")} đ`],
                  ["Ngày thanh toán cọc", refundConfirmation.paidAt ? new Date(refundConfirmation.paidAt).toLocaleString("vi-VN") : "Chưa xác nhận thanh toán"],
                  ["Ngày gửi yêu cầu hoàn", refundConfirmation.refundRequestedAt ? new Date(refundConfirmation.refundRequestedAt).toLocaleString("vi-VN") : "Chưa cập nhật"],
                  ["Lý do hoàn", refundConfirmation.refundReason || "Không có"],
                  ["Trạng thái", getDepositStatusLabel(refundConfirmation.status)],
                  ["Sau xác nhận", "Chuyển Quản lý xác nhận điều kiện hoàn"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500">{label}</span><span className="text-right font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Kiểm tra điều kiện tiếp nhận</h3>
                <div className="space-y-2 text-sm">
                  <ConditionRow ok={refundConfirmation.status === "cho_tiep_nhan_hoan_coc"} label="Yêu cầu hoàn cọc đang chờ Sale tiếp nhận" />
                  <ConditionRow ok={!refundConfirmation.hasContract} label="Phiếu cọc chưa có hợp đồng thuê" />
                  <ConditionRow ok={Boolean(refundConfirmation.paidAt)} label="Khoản cọc đã được xác nhận thanh toán" />
                  <ConditionRow ok={refundConfirmation.roomStatus === "cho_hoan_coc"} label="Phòng đang trong quy trình hoàn cọc" />
                </div>
                <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs leading-5 text-purple-800">
                  Trường hợp đã đặt cọc nhưng chưa ký hợp đồng có mức hoàn cơ bản 80%. Kế toán sẽ kiểm tra nghĩa vụ liên quan và tính số tiền hoàn chính thức.
                </div>
                {!canAcceptRefund && <p className="mt-3 text-xs text-red-600">Không thể tiếp nhận vì yêu cầu chưa đáp ứng đầy đủ điều kiện hoàn cọc trước hợp đồng.</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/sales/registrations?tab=checkout")} className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Quay lại</button>
                <button
                  onClick={async () => {
                    try {
                      await salesApi.acceptDepositRefund(refundConfirmation.depositId);
                      toast.success("Đã tiếp nhận yêu cầu hoàn cọc. Quản lý sẽ xác nhận điều kiện hoàn.");
                      await loadData();
                      navigate("/sales/registrations?tab=checkout");
                    } catch { toast.error("Tiếp nhận hoàn cọc thất bại."); }
                  }}
                  disabled={!canAcceptRefund}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >Tiếp nhận hoàn cọc</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: Chi tiết đăng ký ── */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết hồ sơ đăng ký</h2>
              <button onClick={() => setSelectedReg(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã đăng ký", selectedReg.applicationId],
                ["Khách hàng", selectedReg.customerName],
                ["Điện thoại", selectedReg.phoneNumber],
                ["Email", selectedReg.email ?? "Chưa rõ"],
                ["Giới tính", selectedReg.gender || "Chưa rõ"],
                ["Khu vực yêu cầu", selectedReg.area || "Chưa rõ"],
                ["Sức chứa", `${selectedReg.capacity} người`],
                ["Phòng dự kiến", selectedReg.roomName],
                ["Lịch hẹn", selectedReg.appointmentAt ? new Date(selectedReg.appointmentAt).toLocaleString("vi-VN") : "Chưa gửi"],
                ["Ngày đăng ký", new Date(selectedReg.createdAt).toLocaleDateString("vi-VN")],
                ...(selectedReg.note ? [["Ghi chú", selectedReg.note]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
              {(selectedReg.tenants?.length ?? 0) > 0 && (
                <div className="pt-2">
                  <p className="mb-2 text-xs font-bold uppercase text-gray-500">Danh sách người ở</p>
                  <div className="space-y-2">
                    {selectedReg.tenants!.map((tenant, index) => (
                      <div key={`${tenant.fullName}-${index}`} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{tenant.fullName}</p>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{tenant.isPrimaryTenant ? "Người đại diện" : "Thành viên"}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {tenant.gender ?? "Chưa rõ"} · {tenant.nationality ?? "Chưa rõ"} · CCCD: {tenant.nationalId ?? "Chưa bổ sung"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedReg(null)} className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Chi tiết phiếu cọc ── */}
      {selectedDepositDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết phiếu đặt cọc</h2>
              <button onClick={() => setSelectedDepositDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã phiếu cọc", selectedDepositDetail.depositId],
                ["Khách hàng", selectedDepositDetail.customerName],
                ["Điện thoại", selectedDepositDetail.phoneNumber],
                ["Phòng đặt giữ", selectedDepositDetail.roomName],
                ["Khu vực", selectedDepositDetail.area],
                ["Số tiền cọc", `${selectedDepositDetail.depositAmount.toLocaleString("vi-VN")} đ`],
                ["Giữ chỗ đến", new Date(selectedDepositDetail.holdUntil).toLocaleDateString("vi-VN")],
                ["Trạng thái cọc", getDepositStatusLabel(selectedDepositDetail.status)],
                ...(selectedDepositDetail.refundReason ? [["Lý do hoàn cọc", selectedDepositDetail.refundReason]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              {canCreateRentalFromDeposit(selectedDepositDetail) && (
                <button
                  onClick={() => {
                    setSelectedDepositDetail(null);
                    triggerCreateRentalTabFromDeposit(selectedDepositDetail);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Lập HĐ thuê phòng
                </button>
              )}
              <button
                onClick={() => setSelectedDepositDetail(null)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Chi tiết hợp đồng thuê ── */}
      {selectedRentalDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết hợp đồng thuê</h2>
              <button onClick={() => setSelectedRentalDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã hợp đồng", selectedRentalDetail.contractId],
                ["Khách thuê chính", selectedRentalDetail.customerName],
                ["Số điện thoại", selectedRentalDetail.phoneNumber],
                ["Phòng thuê", selectedRentalDetail.roomName],
                ["Giá thuê/tháng", `${selectedRentalDetail.monthlyRent.toLocaleString("vi-VN")} đ`],
                ["Ngày vào ở", new Date(selectedRentalDetail.moveInDate).toLocaleDateString("vi-VN")],
                ["Thời hạn thuê", `${selectedRentalDetail.durationMonths} tháng`],
                ["Kỳ thanh toán", selectedRentalDetail.paymentCycle],
                ["Mã cọc tham chiếu", selectedRentalDetail.depositRef],
                ["Dịch vụ đi kèm", selectedRentalDetail.services.join(", ") || "—"],
                ["Trạng thái", getRentalStatusLabel(selectedRentalDetail.status)],
                ...(selectedRentalDetail.checkoutRequest
                  ? [
                      ["Ngày trả dự kiến", new Date(selectedRentalDetail.checkoutRequest.expectedDate).toLocaleDateString("vi-VN")],
                      ...(selectedRentalDetail.checkoutRequest.note ? [["Lý do trả phòng", selectedRentalDetail.checkoutRequest.note]] : []),
                    ]
                  : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setSelectedRentalDetail(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}



      {reasonDialog.open && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setReasonDialog((prev) => ({ ...prev, open: false }))} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setReasonDialog((prev) => ({ ...prev, open: false }))}
              className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6">
              <div className="mb-4 flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                    reasonDialog.variant === "danger" ? "bg-red-100" : reasonDialog.variant === "warning" ? "bg-yellow-100" : "bg-blue-100"
                  }`}
                >
                  <AlertTriangle className={`h-6 w-6 ${reasonDialog.variant === "danger" ? "text-red-500" : reasonDialog.variant === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
                </div>
                <div className="pt-1">
                  <h3 className="text-base font-bold text-gray-900">{reasonDialog.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{reasonDialog.message}</p>
                </div>
              </div>
              <textarea
                value={reasonDialog.value}
                onChange={(e) => setReasonDialog((prev) => ({ ...prev, value: e.target.value }))}
                placeholder={reasonDialog.placeholder}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setReasonDialog((prev) => ({ ...prev, open: false }))}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={submitReasonDialog}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                    reasonDialog.variant === "danger" ? "bg-red-600 hover:bg-red-700" : reasonDialog.variant === "warning" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {reasonDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        confirmLabel={confirmDialog.confirmLabel ?? "Xác nhận"}
        variant={confirmDialog.variant ?? "info"}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

function ConditionRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
      <span>{label}</span>
      <span className="font-bold">{ok ? "Đạt" : "Chưa đạt"}</span>
    </div>
  );
}
