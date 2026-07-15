import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Users, Calendar, CheckCircle, X, Send, Search, ArrowRight, Building2,
  AlertTriangle, RefreshCw, FileText, Sparkles, DoorOpen, FileCheck,
  ChevronRight, AlertCircle, Tag
} from "lucide-react";
import { salesApi, type SalesApplication, type SalesDepositSlip, type SalesRentalContract } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { toast } from "sonner";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type MainTab = "registrations" | "deposits" | "contracts" | "checkout";
type CheckoutSubTab = "all" | "hoan_coc" | "tra_phong";
type RegistrationActionFilter =
  | "all"
  | "schedule"
  | "confirm_viewing"
  | "review_deposit"
  | "create_deposit"
  | "review_checkin"
  | "create_contract"
  | "waiting";

export function RegistrationManagement() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>("registrations");
  const [checkoutSubTab, setCheckoutSubTab] = useState<CheckoutSubTab>("all");
  const [registrationActionFilter, setRegistrationActionFilter] = useState<RegistrationActionFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; details?: ReactNode; onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => { } });

  // Filters
  const [areas, setAreas] = useState<string[]>([]);
  const [capacities, setCapacities] = useState<number[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);

  // Search states per tab
  const [searchReg, setSearchReg] = useState("");
  const [searchDeposit, setSearchDeposit] = useState("");
  const [searchContract, setSearchContract] = useState("");
  const [searchCheckout, setSearchCheckout] = useState("");

  // Modals
  const [selectedReg, setSelectedReg] = useState<SalesApplication | null>(null);
  const [selectedDepositDetail, setSelectedDepositDetail] = useState<SalesDepositSlip | null>(null);
  const [selectedRentalDetail, setSelectedRentalDetail] = useState<SalesRentalContract | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", phone: "", email: "", gender: "", genderReq: "",
    area: "", capacity: "", priceRange: "", note: ""
  });

  // Data
  const [regs, setRegs] = useState<SalesApplication[]>([]);
  const [deposits, setDeposits] = useState<SalesDepositSlip[]>([]);
  const [contracts, setContracts] = useState<SalesRentalContract[]>([]);
  const [vacantRooms, setVacantRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Room assignment states
  const [selectedRegForAssign, setSelectedRegForAssign] = useState<SalesApplication | null>(null);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState<Room | null>(null);
  const [assignFilterArea, setAssignFilterArea] = useState("all");
  const [assignFilterPrice, setAssignFilterPrice] = useState("all");
  const [assignAppointmentDate, setAssignAppointmentDate] = useState("");
  const [assignAppointmentNote, setAssignAppointmentNote] = useState("");

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

      const distinctAreas = Array.from(new Set(roomsData.map(r => r.area).filter(Boolean))) as string[];
      const distinctCapacities = Array.from(new Set(roomsData.map(r => r.capacity))).sort((a, b) => a - b);
      const priceOpts = ["Dưới 1.5 triệu", "1.5 – 2 triệu", "Trên 2 triệu"];
      setAreas(distinctAreas);
      setCapacities(distinctCapacities);
      setPriceRanges(priceOpts);
      setVacantRooms(roomsData.filter(r => r.status === "trong"));
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

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc (Tên, SĐT, Email).");
      return;
    }
    try {
      const result = await salesApi.createApplication({
        name: form.name, phone: form.phone, email: form.email,
        gender: form.gender || undefined, genderRequirement: form.genderReq || undefined,
        area: form.area || undefined, capacity: form.capacity ? parseInt(form.capacity) : undefined,
        priceRange: form.priceRange || undefined, note: form.note,
      });
      setForm({ name: "", phone: "", email: "", gender: "", genderReq: "", area: "", capacity: "", priceRange: "", note: "" });
      setShowForm(false);
      toast.success(`Đã ghi nhận đăng ký cho ${result.customerName}.\nMã hồ sơ: ${result.applicationId}`);
      await loadData();
    } catch {
      toast.error("Tạo hồ sơ đăng ký thất bại.");
    }
  };

  // Trigger navigate to deposit contract page with prefilled regRef
  const triggerCreateDepositTab = (reg: SalesApplication) => {
    navigate(`/sales/deposit-contract?regRef=${reg.applicationId}`);
  };

  // Trigger navigate to rental contract page with prefilled depositRef (from application)
  const triggerCreateRentalTab = (reg: SalesApplication) => {
    // Find deposit for this application
    const dep = deposits.find(d => d.customerName === reg.customerName && d.status === "hoan_thanh");
    if (dep) {
      navigate(`/sales/rental-contract?depositRef=${dep.depositId}`);
    } else {
      navigate(`/sales/rental-contract`);
    }
  };

  // Trigger navigate to rental contract page with prefilled depositRef (from deposit slip)
  const triggerCreateRentalTabFromDeposit = (dep: SalesDepositSlip) => {
    navigate(`/sales/rental-contract?depositRef=${dep.depositId}`);
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case "moi": return "Chờ sắp lịch";
      case "da_xem_phong": return "Đã xem phòng";
      case "cho_sale_ra_soat_coc": return "Chờ Sale rà soát cọc";
      case "cho_quan_ly_xac_nhan_coc": return "Chờ QL xác nhận cọc";
      case "cho_khach_thanh_toan_coc": return "Chờ khách thanh toán";
      case "cho_ke_toan_xac_nhan_coc": return "Chờ KT xác nhận cọc";
      case "da_dat_coc": return "Đã đặt cọc";
      case "du_dieu_kien_nhan_phong": return "Đủ ĐK nhận phòng";
      case "cho_sale_doi_chieu_nhan_phong": return "Chờ Sale đối chiếu";
      case "cho_quan_ly_duyet_nhan_phong": return "Chờ QL duyệt nhận phòng";
      case "dang_thue": return "Đang thuê";
      case "da_hoan_thanh": return "Đã hoàn tất";
      default: return st;
    }
  };

  const getDepositStatusLabel = (st: string) => {
    switch (st) {
      case "cho_thanh_toan": return "Chờ thanh toán";
      case "da_thanh_toan": return "Đã thanh toán";
      case "hoan_thanh": return "Hoàn thành";
      case "cho_hoan_coc": return "Chờ hoàn cọc";
      case "da_hoan_coc": return "Đã hoàn cọc";
      case "cho_tiep_nhan_hoan_coc": return "Chờ Sale tiếp nhận";
      case "dang_xac_nhan_hoan_coc": return "Chờ Quản lý xác nhận";
      case "cho_doi_soat_hoan_coc": return "Chờ Kế toán đối soát";
      case "cho_khach_xac_nhan_hoan_coc": return "Chờ khách xác nhận";
      case "cho_hoan_tien": return "Chờ hoàn tiền";
      case "het_han": return "Hết hạn";
      case "huy": return "Đã hủy";
      default: return st;
    }
  };

  const getRentalStatusLabel = (st: string) => {
    switch (st) {
      case "hieu_luc": return "Đang hiệu lực";
      case "cho_tra_phong": return "Chờ trả phòng";
      case "cho_kiem_tra_tra_phong": return "Chờ Quản lý kiểm tra";
      case "cho_doi_soat": return "Chờ đối soát";
      case "cho_khach_xac_nhan": return "Chờ khách xác nhận";
      case "cho_hoan_coc": return "Chờ hoàn/thu tiền";
      case "thanh_ly": return "Đã thanh lý";
      case "het_han": return "Hết hạn";
      default: return st;
    }
  };

  const getCheckoutRequestStatusLabel = (st?: string | null) => {
    switch (st) {
      case "cho_tiep_nhan": return "Chờ Sale xác nhận";
      case "da_xac_nhan_lich": return "Đã xác nhận lịch";
      case "cho_kiem_tra": return "Chờ kiểm tra";
      case "da_kiem_tra": return "Đã kiểm tra";
      case "cho_doi_soat": return "Chờ đối soát";
      case "cho_khach_xac_nhan": return "Chờ khách xác nhận";
      case "cho_hoan_tien": return "Chờ hoàn/thu tiền";
      case "hoan_tat": return "Hoàn tất";
      case "huy": return "Đã hủy";
      default: return st || "Chưa có yêu cầu";
    }
  };

  const statusColor: Record<string, string> = {
    "moi": "bg-blue-100 text-blue-800 border border-blue-200",
    "da_xem_phong": "bg-purple-100 text-purple-700 border border-purple-200",
    "cho_sale_ra_soat_coc": "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "cho_quan_ly_xac_nhan_coc": "bg-orange-100 text-orange-800 border border-orange-200",
    "cho_khach_thanh_toan_coc": "bg-cyan-100 text-cyan-800 border border-cyan-200",
    "cho_ke_toan_xac_nhan_coc": "bg-amber-100 text-amber-800 border border-amber-200",
    "cho_sale_doi_chieu_nhan_phong": "bg-indigo-100 text-indigo-800 border border-indigo-200",
    "cho_quan_ly_duyet_nhan_phong": "bg-violet-100 text-violet-800 border border-violet-200",
    "da_dat_coc": "bg-green-100 text-green-700 border border-green-200",
    "du_dieu_kien_nhan_phong": "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "dang_thue": "bg-teal-100 text-teal-700 border border-teal-200",
    "da_hoan_thanh": "bg-gray-100 text-gray-600 border border-gray-200",
  };

  // ── Filtered lists ──
  const hasActiveDeposit = (applicationId: string) =>
    deposits.some(deposit => deposit.applicationId === applicationId && deposit.status !== "huy");

  const getRegistrationActionFilter = (reg: SalesApplication): RegistrationActionFilter => {
    if (reg.status === "moi" && !reg.appointmentSent) return "schedule";
    if (reg.status === "moi" && reg.appointmentSent && reg.scheduleId) return "confirm_viewing";
    if (reg.status === "cho_sale_ra_soat_coc") return "review_deposit";
    if (reg.status === "cho_khach_thanh_toan_coc" && !reg.hasContract && !hasActiveDeposit(reg.applicationId)) return "create_deposit";
    if (reg.status === "cho_sale_doi_chieu_nhan_phong") return "review_checkin";
    if (reg.status === "du_dieu_kien_nhan_phong" && !reg.hasContract) return "create_contract";
    return "waiting";
  };

  const registrationActionFilters: { id: RegistrationActionFilter; label: string; count: number }[] = [
    { id: "all", label: "Tất cả", count: regs.length },
    { id: "schedule", label: "Sắp lịch", count: regs.filter(r => getRegistrationActionFilter(r) === "schedule").length },
    { id: "confirm_viewing", label: "Xác nhận đã xem", count: regs.filter(r => getRegistrationActionFilter(r) === "confirm_viewing").length },
    { id: "review_deposit", label: "Rà soát cọc", count: regs.filter(r => getRegistrationActionFilter(r) === "review_deposit").length },
    { id: "create_deposit", label: "Lập phiếu cọc", count: regs.filter(r => getRegistrationActionFilter(r) === "create_deposit").length },
    { id: "review_checkin", label: "Đối chiếu nhận phòng", count: regs.filter(r => getRegistrationActionFilter(r) === "review_checkin").length },
    { id: "create_contract", label: "Lập HĐ thuê", count: regs.filter(r => getRegistrationActionFilter(r) === "create_contract").length },
    { id: "waiting", label: "Đang chờ", count: regs.filter(r => getRegistrationActionFilter(r) === "waiting").length },
  ];

  const filteredRegs = regs.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.applicationId.toLowerCase().includes(searchReg.toLowerCase()) ||
      r.phoneNumber.includes(searchReg) ||
      r.roomName.toLowerCase().includes(searchReg.toLowerCase());
    const matchesAction = registrationActionFilter === "all" || getRegistrationActionFilter(r) === registrationActionFilter;
    return matchesSearch && matchesAction;
  });

  const visibleDeposits = deposits.filter(d => !d.hasContract);

  const filteredDeposits = visibleDeposits.filter(d =>
    d.customerName.toLowerCase().includes(searchDeposit.toLowerCase()) ||
    d.depositId.toLowerCase().includes(searchDeposit.toLowerCase()) ||
    d.phoneNumber.includes(searchDeposit) ||
    d.roomName.toLowerCase().includes(searchDeposit.toLowerCase())
  );

  const filteredContracts = contracts.filter(c =>
    c.customerName.toLowerCase().includes(searchContract.toLowerCase()) ||
    c.contractId.toLowerCase().includes(searchContract.toLowerCase()) ||
    c.phoneNumber.includes(searchContract) ||
    c.roomName.toLowerCase().includes(searchContract.toLowerCase())
  );

  // Checkout tab: contracts with checkout request OR deposit slips pending refund
  const checkoutContractStatuses = new Set([
    "cho_tra_phong",
    "cho_kiem_tra_tra_phong",
    "cho_doi_soat",
    "cho_khach_xac_nhan",
    "cho_hoan_coc",
    "thanh_ly",
  ]);
  const refundDepositStatuses = new Set([
    "cho_tiep_nhan_hoan_coc",
    "dang_xac_nhan_hoan_coc",
    "cho_doi_soat_hoan_coc",
    "cho_khach_xac_nhan_hoan_coc",
    "cho_hoan_tien",
    "da_hoan_coc",
  ]);
  const checkoutContracts = contracts.filter(c => checkoutContractStatuses.has(c.status) || c.checkoutRequest);
  const refundDeposits = deposits.filter(d => refundDepositStatuses.has(d.status) && !d.hasContract);

  const filteredCheckoutContracts = checkoutContracts.filter(c =>
    c.customerName.toLowerCase().includes(searchCheckout.toLowerCase()) ||
    c.contractId.toLowerCase().includes(searchCheckout.toLowerCase()) ||
    c.phoneNumber.includes(searchCheckout) ||
    c.roomName.toLowerCase().includes(searchCheckout.toLowerCase())
  );

  const filteredRefundDeposits = refundDeposits.filter(d =>
    d.customerName.toLowerCase().includes(searchCheckout.toLowerCase()) ||
    d.depositId.toLowerCase().includes(searchCheckout.toLowerCase()) ||
    d.phoneNumber.includes(searchCheckout) ||
    d.roomName.toLowerCase().includes(searchCheckout.toLowerCase())
  );

  const tabConfig: { id: MainTab; label: string }[] = [
    { id: "registrations", label: "Hồ sơ đăng ký" },
    { id: "deposits", label: "Phiếu đặt cọc" },
    { id: "contracts", label: "HĐ thuê phòng" },
    { id: "checkout", label: "Trả phòng & Hoàn cọc" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Quản lý giao dịch Sales</h1>
          <p className="text-sm text-gray-500">Theo dõi và xử lý hồ sơ, phiếu cọc, hợp đồng, trả phòng</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={loadData} className="p-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors" title="Làm mới">
            <RefreshCw className="w-4 h-4" />
          </button>
          {mainTab === "registrations" && (
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              + Nhập đăng ký mới
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-1 bg-gray-100/80 rounded-2xl p-1.5">
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${mainTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: HỒ SƠ ĐĂNG KÝ ── */}
      {mainTab === "registrations" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchReg}
              onChange={e => setSearchReg(e.target.value)}
              placeholder="Tìm theo tên khách, mã đăng ký, SĐT, phòng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {registrationActionFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setRegistrationActionFilter(filter.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  registrationActionFilter === filter.id
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Tag className="h-3 w-3" />
                {filter.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  registrationActionFilter === filter.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
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
              ) : filteredRegs.map(reg => (
                <div key={reg.applicationId} className="p-5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{reg.customerName}</h3>
                          <p className="text-xs text-gray-500">{reg.phoneNumber} · {reg.email ?? "Không có email"}</p>
                          <p className="text-xs text-gray-400">Mã ĐK: <span className="font-mono">{reg.applicationId}</span> · {new Date(reg.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs ml-12">
                        <div><p className="text-gray-400">Khu vực</p><p className="font-medium text-gray-800">{reg.area || "—"}</p></div>
                        <div><p className="text-gray-400">Giới tính</p><p className="font-medium text-gray-800">{reg.gender || "—"}</p></div>
                        <div><p className="text-gray-400">Sức chứa</p><p className="font-medium text-gray-800">{reg.capacity} người</p></div>
                        <div><p className="text-gray-400">Mức giá</p><p className="font-medium text-gray-800">{reg.priceRange || "—"}</p></div>
                        <div><p className="text-gray-400">Phòng</p><p className="font-medium text-gray-800 truncate">{reg.roomName}</p></div>
                      </div>
                      {reg.appointmentAt && (
                        <div className="mt-2 ml-12 flex items-center gap-1 text-xs text-green-700 font-medium">
                          <Calendar className="w-3 h-3" /> Lịch hẹn: {new Date(reg.appointmentAt).toLocaleString("vi-VN")}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor[reg.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {getStatusLabel(reg.status)}
                      </span>

                      {/* Action: Sắp lịch xem phòng */}
                      {reg.status === "moi" && !reg.appointmentSent && (
                        <button
                          onClick={() => {
                            setSelectedRegForAssign(reg);
                            setSelectedRoomForAssign(vacantRooms.find(room => room.roomId === reg.roomId) ?? null);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <ArrowRight className="w-3 h-3" /> Sắp lịch xem phòng
                        </button>
                      )}

                      {/* Action: Xác nhận đã xem phòng */}
                      {reg.status === "moi" && reg.appointmentSent && reg.scheduleId && (
                        <button
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Xác nhận xem phòng",
                            message: "Xác nhận khách hàng đã xem phòng xong?",
                            onConfirm: async () => {
                              setConfirmDialog(prev => ({ ...prev, open: false }));
                              try {
                                await salesApi.completeSchedule(reg.scheduleId!);
                                toast.success("Đã ghi nhận kết quả xem phòng.");
                                await loadData();
                              } catch {
                                toast.error("Không thể xác nhận kết quả xem phòng.");
                              }
                            }
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <CheckCircle className="w-3 h-3" /> Xác nhận đã xem
                        </button>
                      )}

                      {/* Action: Rà soát cọc */}
                      {reg.status === "cho_sale_ra_soat_coc" && (
                        <button
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Rà soát hồ sơ cọc",
                            message: "Xác nhận hồ sơ khách đủ điều kiện để tiến hành lập phiếu đặt cọc?",
                            onConfirm: async () => {
                              setConfirmDialog(prev => ({ ...prev, open: false }));
                              try {
                                await salesApi.reviewDeposit(reg.applicationId);
                                toast.success("Đã rà soát hồ sơ. Hệ thống thông báo Quản lý xác nhận.");
                                await loadData();
                              } catch {
                                toast.error("Rà soát thất bại.");
                              }
                            }
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <FileCheck className="w-3 h-3" /> Rà soát cọc
                        </button>
                      )}

                      {/* Action: Lập phiếu đặt cọc */}
                      {reg.status === "cho_khach_thanh_toan_coc" && !reg.hasContract && !hasActiveDeposit(reg.applicationId) && (
                        <button
                          onClick={() => triggerCreateDepositTab(reg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Sparkles className="w-3 h-3" /> Lập phiếu đặt cọc →
                        </button>
                      )}

                      {/* Action: Đối chiếu nhận phòng */}
                      {reg.status === "cho_sale_doi_chieu_nhan_phong" && (
                        <button
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Đối chiếu nhận phòng",
                            message: "Xác nhận đã đối chiếu hồ sơ khách đủ điều kiện nhận phòng?",
                            onConfirm: async () => {
                              setConfirmDialog(prev => ({ ...prev, open: false }));
                              try {
                                await salesApi.reviewCheckin(reg.applicationId);
                                toast.success("Đã ghi nhận đối chiếu. Chờ Quản lý duyệt nhận phòng.");
                                await loadData();
                              } catch {
                                toast.error("Đối chiếu thất bại.");
                              }
                            }
                          })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <FileCheck className="w-3 h-3" /> Đối chiếu nhận phòng
                        </button>
                      )}

                      {/* Action: Lập HĐ thuê — chỉ hiện khi chưa có hợp đồng */}
                      {reg.status === "du_dieu_kien_nhan_phong" && !reg.hasContract && (
                        <button
                          onClick={() => triggerCreateRentalTab(reg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <FileText className="w-3 h-3" /> Lập HĐ thuê →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PHIẾU ĐẶT CỌC ── */}
      {mainTab === "deposits" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchDeposit}
              onChange={e => setSearchDeposit(e.target.value)}
              placeholder="Tìm phiếu cọc theo tên khách, mã phiếu, phòng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : filteredDeposits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không tìm thấy phiếu đặt cọc nào</p>
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
                      <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDeposits.map(d => (
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
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {d.depositAmount.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {new Date(d.holdUntil).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${d.status === "hoan_thanh" ? "bg-green-100 text-green-700 border-green-200" :
                              d.status === "cho_thanh_toan" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                d.status === "da_thanh_toan" ? "bg-blue-100 text-blue-700 border-blue-200" :
                                  d.status === "cho_hoan_coc" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    d.status === "da_hoan_coc" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                      "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                            {getDepositStatusLabel(d.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Lập HĐ thuê — chỉ hiện khi hoàn thành cọc và chưa có HĐ */}
                            {d.status === "hoan_thanh" && !d.hasContract && (
                              <button
                                onClick={() => triggerCreateRentalTabFromDeposit(d)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" /> Lập HĐ thuê
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
      )}

      {/* ── TAB: HỢP ĐỒNG THUÊ ── */}
      {mainTab === "contracts" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchContract}
              onChange={e => setSearchContract(e.target.value)}
              placeholder="Tìm hợp đồng theo tên khách, mã HĐ, phòng..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Không tìm thấy hợp đồng thuê nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Mã hợp đồng</th>
                      <th className="px-5 py-3.5 font-bold">Khách hàng</th>
                      <th className="px-5 py-3.5 font-bold">Phòng</th>
                      <th className="px-5 py-3.5 font-bold">Giá thuê/tháng</th>
                      <th className="px-5 py-3.5 font-bold">Ngày vào ở</th>
                      <th className="px-5 py-3.5 font-bold">Trạng thái</th>
                      <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContracts.map(c => (
                      <tr key={c.contractId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-gray-700 font-bold">{c.contractId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{c.customerName}</p>
                          <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">{c.roomName}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {c.monthlyRent.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {new Date(c.moveInDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${c.status === "hieu_luc" ? "bg-green-100 text-green-700 border-green-200" :
                              c.status === "cho_tra_phong" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                c.status === "da_tra_phong" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                  "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                            {getRentalStatusLabel(c.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
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
      )}

      {/* ── TAB: TRẢ PHÒNG & HOÀN CỌC ── */}
      {mainTab === "checkout" && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-2 items-center">
            {([
              { id: "all" as CheckoutSubTab, label: "Tất cả" },
              { id: "tra_phong" as CheckoutSubTab, label: "Trả phòng" },
              { id: "hoan_coc" as CheckoutSubTab, label: "Hoàn cọc" },
            ]).map(sub => (
              <button
                key={sub.id}
                onClick={() => setCheckoutSubTab(sub.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${checkoutSubTab === sub.id
                    ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                    : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
                  }`}
              >
                <Tag className="w-3 h-3" />
                {sub.label}
              </button>
            ))}

            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchCheckout}
                onChange={e => setSearchCheckout(e.target.value)}
                placeholder="Tìm theo tên, mã HĐ, phòng..."
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm w-64"
              />
            </div>
          </div>

          {/* Trả phòng section */}
          {(checkoutSubTab === "all" || checkoutSubTab === "tra_phong") && (
            <div className="space-y-3">
              {checkoutSubTab === "all" && (
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" /> Trả phòng
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}
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
                        {filteredCheckoutContracts.map(c => (
                          <tr key={c.contractId} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs font-bold text-gray-700">{c.contractId}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-900">{c.customerName}</p>
                              <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                            </td>
                            <td className="px-5 py-4 font-medium text-gray-800">{c.roomName}</td>
                            <td className="px-5 py-4 text-xs text-gray-600">
                              {c.checkoutRequest ? new Date(c.checkoutRequest.expectedDate).toLocaleDateString("vi-VN") : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${c.checkoutRequest?.status === "cho_tiep_nhan" ? "bg-orange-100 text-orange-800 border-orange-200" :
                                    "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}>
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
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      title: "Xác nhận lịch trả phòng",
                                      message: "Kiểm tra thông tin lịch trả phòng trước khi chuyển hồ sơ sang Quản lý kiểm tra phòng.",
                                      details: (
                                        <div className="space-y-2 text-sm">
                                          {[
                                            ["Mã hợp đồng", c.contractId],
                                            ["Khách hàng", c.customerName],
                                            ["Số điện thoại", c.phoneNumber],
                                            ["Phòng", c.roomName],
                                            ["Ngày trả dự kiến", c.checkoutRequest ? new Date(c.checkoutRequest.expectedDate).toLocaleDateString("vi-VN") : "Chưa có"],
                                            ["Ghi chú", c.checkoutRequest?.note || "Không có"],
                                            ["Trạng thái hiện tại", getCheckoutRequestStatusLabel(c.checkoutRequest?.status)],
                                            ["Sau xác nhận", "Chuyển Quản lý kiểm tra phòng"],
                                          ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-4 border-b border-gray-200/70 pb-2 last:border-0 last:pb-0">
                                              <span className="shrink-0 text-gray-500">{label}</span>
                                              <span className="text-right font-semibold text-gray-900">{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ),
                                      onConfirm: async () => {
                                        setConfirmDialog(prev => ({ ...prev, open: false }));
                                        try {
                                          await salesApi.checkoutContract(c.contractId, {
                                            expectedDate: c.checkoutRequest?.expectedDate ?? new Date().toISOString(),
                                            note: c.checkoutRequest?.note ?? "",
                                          });
                                          toast.success("Đã xác nhận lịch trả phòng. Quản lý sẽ tiếp tục kiểm tra.");
                                          await loadData();
                                        } catch {
                                          toast.error("Xác nhận lịch trả phòng thất bại.");
                                        }
                                      }
                                    })}
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
          )}

          {/* Hoàn cọc section */}
          {(checkoutSubTab === "all" || checkoutSubTab === "hoan_coc") && (
            <div className="space-y-3">
              {checkoutSubTab === "all" && (
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Hoàn cọc
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}
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
                          <th className="px-5 py-3.5 font-bold">Trạng thái hoàn cọc</th>
                          <th className="px-5 py-3.5 text-right font-bold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredRefundDeposits.map(d => (
                          <tr key={d.depositId} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono text-xs font-bold text-gray-700">{d.depositId}</span>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-gray-900">{d.customerName}</p>
                              <p className="text-xs text-gray-500">{d.phoneNumber}</p>
                            </td>
                            <td className="px-5 py-4 font-medium text-gray-800">{d.roomName}</td>
                            <td className="px-5 py-4 font-bold text-gray-900">
                              {d.depositAmount.toLocaleString("vi-VN")} đ
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-600 max-w-[160px] truncate">
                              {d.refundReason || "—"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${d.status === "cho_tiep_nhan_hoan_coc" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                    d.status === "da_hoan_coc" ? "bg-gray-100 text-gray-600 border-gray-200" :
                                      "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}>
                                  {getDepositStatusLabel(d.status)}
                                </span>
                                <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Hoàn cọc
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {d.status === "cho_tiep_nhan_hoan_coc" && (
                                  <button
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      title: "Xác nhận tiếp nhận hoàn cọc",
                                      message: "Kiểm tra thông tin yêu cầu hoàn cọc trước khi chuyển hồ sơ sang Quản lý xác nhận điều kiện hoàn.",
                                      details: (
                                        <div className="space-y-2 text-sm">
                                          {[
                                            ["Mã phiếu cọc", d.depositId],
                                            ["Khách hàng", d.customerName],
                                            ["Số điện thoại", d.phoneNumber],
                                            ["Phòng", d.roomName],
                                            ["Số tiền cọc", `${d.depositAmount.toLocaleString("vi-VN")} đ`],
                                            ["Lý do hoàn", d.refundReason || "Không có"],
                                            ["Trạng thái hiện tại", getDepositStatusLabel(d.status)],
                                            ["Sau xác nhận", "Chuyển Quản lý xác nhận điều kiện hoàn"],
                                          ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between gap-4 border-b border-gray-200/70 pb-2 last:border-0 last:pb-0">
                                              <span className="shrink-0 text-gray-500">{label}</span>
                                              <span className="text-right font-semibold text-gray-900">{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ),
                                      onConfirm: async () => {
                                        setConfirmDialog(prev => ({ ...prev, open: false }));
                                        try {
                                          await salesApi.acceptDepositRefund(d.depositId);
                                          toast.success("Đã tiếp nhận yêu cầu hoàn cọc. Quản lý sẽ xác nhận điều kiện hoàn.");
                                          await loadData();
                                        } catch {
                                          toast.error("Tiếp nhận hoàn cọc thất bại.");
                                        }
                                      }
                                    })}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Tiếp nhận hoàn cọc
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
          )}
        </div>
      )}

      {/* ── MODAL: Nhập đăng ký mới ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Nhập thông tin đăng ký thuê</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Thông tin khách hàng</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => f("name", e.target.value)} placeholder="Nhập họ tên khách hàng" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="09xxxxxxxx" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select value={form.gender} onChange={e => f("gender", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="">-- Không chọn --</option>
                      <option>Nam</option>
                      <option>Nữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input value={form.email} onChange={e => f("email", e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide pt-2">Yêu cầu thuê</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <select value={form.area} onChange={e => f("area", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số người</label>
                  <select value={form.capacity} onChange={e => f("capacity", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    {capacities.map(c => <option key={c} value={c}>{c} người</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính yêu cầu</label>
                  <select value={form.genderReq} onChange={e => f("genderReq", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Không giới hạn">Không giới hạn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá mong muốn</label>
                  <select value={form.priceRange} onChange={e => f("priceRange", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={form.note} onChange={e => f("note", e.target.value)} rows={2} placeholder="Yêu cầu đặc biệt, thời gian xem phòng mong muốn..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Hủy</button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Ghi nhận đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Chi tiết đăng ký ── */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết hồ sơ đăng ký</h2>
              <button onClick={() => setSelectedReg(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã đăng ký", selectedReg.applicationId],
                ["Trạng thái", getStatusLabel(selectedReg.status)],
                ["Khách hàng", selectedReg.customerName],
                ["Điện thoại", selectedReg.phoneNumber],
                ["Email", selectedReg.email ?? "Chưa rõ"],
                ["Giới tính", selectedReg.gender || "Chưa rõ"],
                ["Khu vực yêu cầu", selectedReg.area || "Chưa rõ"],
                ["Sức chứa", `${selectedReg.capacity} người`],
                ["Mức giá", selectedReg.priceRange || "Chưa rõ"],
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
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedReg(null)} className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
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
              <button onClick={() => setSelectedDepositDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
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
              {selectedDepositDetail.status === "hoan_thanh" && !selectedDepositDetail.hasContract && (
                <button
                  onClick={() => { setSelectedDepositDetail(null); triggerCreateRentalTabFromDeposit(selectedDepositDetail); }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Lập HĐ thuê phòng
                </button>
              )}
              <button onClick={() => setSelectedDepositDetail(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 transition-colors">Đóng</button>
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
              <button onClick={() => setSelectedRentalDetail(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
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
                ...(selectedRentalDetail.checkoutRequest ? [
                  ["Ngày trả dự kiến", new Date(selectedRentalDetail.checkoutRequest.expectedDate).toLocaleDateString("vi-VN")],
                  ...(selectedRentalDetail.checkoutRequest.note ? [["Lý do trả phòng", selectedRentalDetail.checkoutRequest.note]] : []),
                ] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setSelectedRentalDetail(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Room Assignment & Schedule ── */}
      {selectedRegForAssign && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Phân phòng & Sắp lịch xem phòng</h2>
                <p className="text-xs text-gray-500">Mã ĐK: {selectedRegForAssign.applicationId}</p>
              </div>
              <button onClick={() => setSelectedRegForAssign(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Left: Registration Details & Comparison */}
              <div className="flex-1 p-6 border-r border-gray-100 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                  <p className="font-semibold text-blue-900 uppercase">Yêu cầu của khách: {selectedRegForAssign.customerName}</p>
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    <p><strong>Giới tính:</strong> {selectedRegForAssign.gender || "Chưa rõ"}</p>
                    <p><strong>Khu vực:</strong> {selectedRegForAssign.area}</p>
                    <p><strong>Sức chứa:</strong> {selectedRegForAssign.capacity} người</p>
                    <p><strong>Mức giá:</strong> {selectedRegForAssign.priceRange}</p>
                  </div>
                </div>

                {selectedRoomForAssign ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-800 border-b pb-1">Kết quả đối chiếu điều kiện cho thuê</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        {
                          label: "Khu vực",
                          req: selectedRegForAssign.area,
                          roomVal: selectedRoomForAssign.area ?? "Chưa rõ",
                          match: selectedRegForAssign.area === selectedRoomForAssign.area,
                        },
                        {
                          label: "Giới tính khách / Phòng cho phép",
                          req: selectedRegForAssign.gender || "Chưa rõ",
                          roomVal: selectedRoomForAssign.allowedGender === "nam" ? "Nam" : selectedRoomForAssign.allowedGender === "nu" ? "Nữ" : "Không giới hạn",
                          match: !selectedRoomForAssign.allowedGender || !selectedRegForAssign.gender ||
                            selectedRoomForAssign.allowedGender.toLowerCase() === "khong_gioi_han" ||
                            (selectedRegForAssign.gender === "Nam" && selectedRoomForAssign.allowedGender.toLowerCase() === "nam") ||
                            (selectedRegForAssign.gender === "Nữ" && selectedRoomForAssign.allowedGender.toLowerCase() === "nu"),
                        },
                        {
                          label: "Sức chứa tối đa",
                          req: `${selectedRegForAssign.capacity} người`,
                          roomVal: `${selectedRoomForAssign.capacity} người`,
                          match: selectedRegForAssign.capacity <= selectedRoomForAssign.capacity,
                        },
                        {
                          label: "Mức giá",
                          req: selectedRegForAssign.priceRange,
                          roomVal: `${selectedRoomForAssign.roomPrice?.toLocaleString("vi-VN") ?? "0"} đ`,
                          match: (() => {
                            const price = selectedRoomForAssign.roomPrice ?? 0;
                            if (selectedRegForAssign.priceRange === "Dưới 1.5 triệu") return price <= 1500000;
                            if (selectedRegForAssign.priceRange === "1.5 – 2 triệu") return price > 1500000 && price <= 2000000;
                            return price > 2000000;
                          })(),
                        },
                      ].map(item => (
                        <div key={item.label} className={`flex justify-between items-center p-2.5 rounded-lg border ${item.match ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                          <div>
                            <p className="font-semibold text-xs">{item.label}</p>
                            <p className="text-[10px] opacity-75">Khách cần: {item.req} · Phòng có: {item.roomVal}</p>
                          </div>
                          <span className="font-bold text-xs">{item.match ? "✓ Thỏa mãn" : "✗ Không khớp"}</span>
                        </div>
                      ))}
                    </div>

                    {!(selectedRegForAssign.area === selectedRoomForAssign.area && selectedRegForAssign.capacity <= selectedRoomForAssign.capacity) ? (
                      <div className="p-3 bg-red-100 border border-red-200 rounded-xl space-y-3">
                        <div className="flex gap-1.5 text-xs text-red-800 font-bold items-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Cảnh báo: Khách thuê không thỏa mãn điều kiện thuê!</span>
                        </div>
                        <p className="text-[11px] text-red-700">Thông tin đối chiếu không khớp với điều kiện cho thuê. Hãy chọn lại phòng khác phù hợp.</p>
                        <button onClick={() => setSelectedRoomForAssign(null)} className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold">Chọn lại phòng khác</button>
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="font-bold text-xs text-gray-700 uppercase">Lên lịch hẹn xem phòng</p>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian xem phòng dự kiến <span className="text-red-500">*</span></label>
                          <input type="datetime-local" value={assignAppointmentDate} onChange={e => setAssignAppointmentDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú lịch hẹn</label>
                          <input type="text" placeholder="Vd: Xem vào buổi sáng..." value={assignAppointmentNote} onChange={e => setAssignAppointmentNote(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={async () => {
                              if (!assignAppointmentDate) { toast.warning("Vui lòng chọn ngày giờ hẹn xem phòng."); return; }
                              try {
                                await salesApi.createSchedule(selectedRegForAssign.applicationId, {
                                  roomId: selectedRoomForAssign.roomId,
                                  appointmentAt: new Date(assignAppointmentDate).toISOString(),
                                  note: assignAppointmentNote,
                                });
                                setSelectedRegForAssign(null);
                                toast.success("Lên lịch hẹn thành công!\nHệ thống tự động gửi thông báo lịch xem phòng đến khách hàng.");
                                await loadData();
                              } catch {
                                toast.error("Không thể sắp lịch xem phòng.");
                              }
                            }}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            Xác nhận & Gửi lịch hẹn
                          </button>
                          <button onClick={() => setSelectedRoomForAssign(null)} className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">Chọn lại</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-blue-600" />
                    <p className="text-xs font-medium">Chọn một phòng ở danh sách bên phải để đối chiếu điều kiện thuê</p>
                  </div>
                )}
              </div>

              {/* Right: Room search and select */}
              <div className="w-full md:w-96 p-6 bg-gray-50 flex flex-col border-t md:border-t-0 md:border-l border-gray-150 max-h-[50vh] md:max-h-none">
                <h3 className="font-bold text-gray-950 text-sm mb-4">Danh sách phòng trống</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Khu vực</label>
                    <select value={assignFilterArea} onChange={e => setAssignFilterArea(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white">
                      <option value="all">Tất cả</option>
                      <option value="Khu A">Khu A</option>
                      <option value="Khu B">Khu B</option>
                      <option value="Khu C">Khu C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Mức giá</label>
                    <select value={assignFilterPrice} onChange={e => setAssignFilterPrice(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white">
                      <option value="all">Tất cả</option>
                      <option value="low">Dưới 1.5 triệu</option>
                      <option value="mid">1.5 – 2 triệu</option>
                      <option value="high">Trên 2 triệu</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {vacantRooms
                    .filter(r => {
                      const matchArea = assignFilterArea === "all" || r.area === assignFilterArea;
                      const matchPrice = assignFilterPrice === "all" ||
                        (assignFilterPrice === "low" && (r.roomPrice ?? 0) <= 1500000) ||
                        (assignFilterPrice === "mid" && (r.roomPrice ?? 0) > 1500000 && (r.roomPrice ?? 0) <= 2000000) ||
                        (assignFilterPrice === "high" && (r.roomPrice ?? 0) > 2000000);
                      return matchArea && matchPrice;
                    })
                    .map(room => (
                      <div
                        key={room.roomId}
                        onClick={() => setSelectedRoomForAssign(room)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedRoomForAssign?.roomId === room.roomId ? "bg-blue-100 border-blue-400 shadow-sm" : "bg-white border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs text-gray-950">{room.roomName} – {room.branchName}</p>
                            <p className="text-[10px] text-gray-500">{room.area ?? "Chưa rõ"} · Sức chứa: {room.capacity} người · Cho: {room.allowedGender ?? "Không giới hạn"}</p>
                          </div>
                          <span className="text-xs font-bold text-blue-700">{room.roomPrice?.toLocaleString("vi-VN")} đ</span>
                        </div>
                      </div>
                    ))}
                </div>
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
        confirmLabel="Xác nhận"
        variant="info"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
