import { useState, useEffect } from "react";
import { Users, Calendar, CheckCircle, Eye, X, Send, Search, ArrowRight, Building2, AlertTriangle, RefreshCw } from "lucide-react";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { toast } from "sonner";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function RegistrationManagement() {
  const [showForm, setShowForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: "", message: "", onConfirm: () => {} });
  // Dynamic data for registration filters
  const [areas, setAreas] = useState<string[]>([]);
  const [capacities, setCapacities] = useState<number[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [selectedReg, setSelectedReg] = useState<SalesApplication | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", gender: "", genderReq: "", area: "", capacity: "", priceRange: "", note: "" });


  const [regs, setRegs] = useState<SalesApplication[]>([]);
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [applications, roomsData] = await Promise.all([
        salesServiceFetchApps(),
        roomService.getAll()
      ]);
      setRegs(applications);
      // Derive filter options from rooms
      const distinctAreas = Array.from(new Set(roomsData.map(r => r.area).filter(Boolean))) as string[];
      const distinctCapacities = Array.from(new Set(roomsData.map(r => r.capacity))).sort((a, b) => a - b);
      const priceOpts = ["Dưới 1.5 triệu", "1.5 – 2 triệu", "Trên 2 triệu"]; // static list (could be derived)
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
  };

  const salesServiceFetchApps = async () => {
    try {
      return await salesApi.getApplications();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    loadData();
    const refreshTimer = window.setInterval(loadData, 10_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") loadData();
    };
    window.addEventListener("focus", loadData);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadData);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    // Required fields: name, phone, email
    if (!form.name || !form.phone || !form.email) {
      toast.warning("Vui lòng điền đủ thông tin bắt buộc (Tên, SĐT, Email).");
      return;
    }
    try {
      const result = await salesApi.createApplication({
        name: form.name,
        phone: form.phone,
        email: form.email,
        gender: form.gender || undefined,
        genderRequirement: form.genderReq || undefined,
        area: form.area || undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        priceRange: form.priceRange || undefined,
        note: form.note,
      });
      setForm({ name: "", phone: "", email: "", gender: "", genderReq: "", area: "", capacity: "", priceRange: "", note: "" });
      setShowForm(false);
      toast.success(`Đã ghi nhận đăng ký cho ${result.customerName}.\nMã hồ sơ: ${result.applicationId}`);
      await loadData();
    } catch (err) {
      toast.error("Tạo hồ sơ đăng ký thất bại.");
    }
  };

  const handleSendAppointment = async (applicationId: string, roomId: string) => {
    if (!roomId) {
      toast.warning("Hồ sơ chưa được phân phòng.");
      return;
    }
    const defaultTime = new Date();
    defaultTime.setDate(defaultTime.getDate() + 2);
    defaultTime.setHours(9, 0, 0, 0);

    try {
      await salesApi.createSchedule(applicationId, {
        roomId: roomId,
        appointmentAt: defaultTime.toISOString(),
        note: "Đặt lịch tự động xem phòng"
      });
      toast.success("Đã gửi lịch hẹn xem phòng đến email/SĐT khách hàng.");
      await loadData();
    } catch (err) {
      toast.error("Sắp lịch xem phòng thất bại.");
    }
  };

  const handleCompleteSchedule = async (application: SalesApplication) => {
    try {
      // Find viewing schedules in state that are not hoan_thanh. We will use a mockup or fetch them.
      // Since completeSchedule takes scheduleId, we can just call it on the most recent schedule ID.
      // In SalesApplicationDto we can find scheduleId. Oh, wait, in SalesApplicationDto we didn't add scheduleId!
      // But we can check viewing schedules by calling salesApi.getDashboard to find scheduleId or fetch apps.
      // Actually, we can fetch all applications and map, wait, let's see.
      // In SalesWorkflowService, we query RentalApplications which includes schedules. We can write an endpoint or look up the schedule.
      // Let's add scheduleId to SalesApplicationDto or write code in service.
      // Wait, we can modify SalesApplicationDto in SalesDtos.cs to include string? ScheduleId!
      // Yes! That's much cleaner!
      // Let's do that right after.
    } catch (err) {
      toast.error("Xác nhận đã xem phòng thất bại.");
    }
  };

  const filtered = regs.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.applicationId.toLowerCase().includes(search.toLowerCase()) ||
    r.phoneNumber.includes(search) ||
    r.roomName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusLabel = (st: string) => {
    switch (st) {
      case "moi": return "Chờ sắp lịch";
      case "da_xem_phong": return "Đã xem";
      case "cho_sale_ra_soat_coc": return "Chờ Sale rà soát cọc";
      case "cho_quan_ly_xac_nhan_coc": return "Chờ Quản lý xác nhận cọc";
      case "cho_khach_thanh_toan_coc": return "Chờ khách thanh toán cọc";
      case "cho_ke_toan_xac_nhan_coc": return "Chờ Kế toán xác nhận cọc";
      case "da_dat_coc": return "Đã cọc";
      case "du_dieu_kien_nhan_phong": return "Đủ điều kiện nhận phòng";
      case "cho_sale_doi_chieu_nhan_phong": return "Chờ Sale đối chiếu nhận phòng";
      case "cho_quan_ly_duyet_nhan_phong": return "Chờ Quản lý duyệt nhận phòng";
      case "dang_thue": return "Đang thuê";
      default: return st;
    }
  };

  const statusColor: Record<string, string> = {
    "moi": "bg-blue-150 text-blue-800 border border-blue-200",
    "da_xem_phong": "bg-purple-100 text-purple-700",
    "cho_sale_ra_soat_coc": "bg-yellow-100 text-yellow-800",
    "cho_quan_ly_xac_nhan_coc": "bg-orange-100 text-orange-800",
    "cho_khach_thanh_toan_coc": "bg-cyan-100 text-cyan-800",
    "cho_ke_toan_xac_nhan_coc": "bg-amber-100 text-amber-800",
    "cho_sale_doi_chieu_nhan_phong": "bg-indigo-100 text-indigo-800",
    "cho_quan_ly_duyet_nhan_phong": "bg-violet-100 text-violet-800",
    "da_dat_coc": "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Tiếp nhận đăng ký thuê phòng</h1>
          <p className="text-sm text-gray-500">Ghi nhận thông tin khách hàng và gửi lịch hẹn xem phòng</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
            Nhập đăng ký mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên khách, mã đăng ký, SĐT..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map(reg => (
            <div key={reg.applicationId} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.customerName}</h3>
                      <p className="text-xs text-gray-500">{reg.phoneNumber} · {reg.email ?? "Không có email"}</p>
                      <p className="text-xs text-gray-400">Mã ĐK: {reg.applicationId} · Ngày gửi: {new Date(reg.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs ml-13">
                    <div><p className="text-gray-400">Khu vực</p><p className="font-medium text-gray-800">{reg.area}</p></div>
                    <div><p className="text-gray-400">Giới tính</p><p className="font-medium text-gray-800">{reg.gender}</p></div>
                    <div><p className="text-gray-400">Sức chứa</p><p className="font-medium text-gray-800">{reg.capacity} người</p></div>
                    <div><p className="text-gray-400">Mức giá</p><p className="font-medium text-gray-800">{reg.priceRange}</p></div>
                    <div><p className="text-gray-400">Phòng dự kiến</p><p className="font-medium text-gray-800">{reg.roomName}</p></div>
                  </div>
                  {reg.appointmentAt && (
                    <div className="mt-2 ml-13 flex items-center gap-1 text-xs text-green-700 font-semibold">
                      <Calendar className="w-3 h-3" /> Lịch hẹn: {new Date(reg.appointmentAt).toLocaleString("vi-VN")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[reg.status] ?? "bg-gray-100 text-gray-600"}`}>{getStatusLabel(reg.status)}</span>
                  {reg.status === "moi" && !reg.appointmentSent ? (
                    <button
                      onClick={() => { setSelectedRegForAssign(reg); setSelectedRoomForAssign(vacantRooms.find((room) => room.roomId === reg.roomId) ?? null); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" /> Sắp lịch xem phòng
                    </button>
                  ) : (
                    reg.status === "moi" && reg.appointmentSent && reg.scheduleId && (
                      <button
                        onClick={() => {
                            setConfirmDialog({
                              open: true,
                              title: "Xác nhận xem phòng",
                              message: "Xác nhận khách hàng đã xem phòng xong?",
                              onConfirm: async () => {
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                                try {
                                  await salesApi.completeSchedule(reg.scheduleId!);
                                  toast.success("Đã ghi nhận kết quả xem phòng.\nHồ sơ chuyển sang trạng thái: Đã xem phòng.");
                                  await loadData();
                                } catch (err) {
                                  toast.error("Không thể xác nhận kết quả xem phòng.");
                                }
                              }
                            });
                          }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Xác nhận đã xem
                      </button>
                    )
                  )}
                  <button onClick={() => setSelectedReg(reg)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors">
                    <Eye className="w-3 h-3" /> Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Không tìm thấy đăng ký nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nhập đăng ký mới */}
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
                    {areas.map(a => (<option key={a} value={a}>{a}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số người</label>
                  <select value={form.capacity} onChange={e => f("capacity", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    {capacities.map(c => (<option key={c} value={c}>{c} người</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính yêu cầu</label>
                  <select value={form.genderReq} onChange={e => f("genderReq", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Không giới hạn">Không giới hạn (Nam &amp; Nữ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá mong muốn (VNĐ/tháng)</label>
                  <select value={form.priceRange} onChange={e => f("priceRange", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Không chọn --</option>
                    {priceRanges.map(p => (<option key={p} value={p}>{p}</option>))}
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

      {/* Modal: Chi tiết đăng ký */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết đăng ký</h2>
              <button onClick={() => setSelectedReg(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ["Mã đăng ký", selectedReg.applicationId],
                ["Trạng thái", getStatusLabel(selectedReg.status)],
                ["Khách hàng", selectedReg.customerName],
                ["Điện thoại", selectedReg.phoneNumber],
                ["Email", selectedReg.email ?? "Chưa rõ"],
                ["Giới tính", selectedReg.gender],
                ["Khu vực yêu cầu", selectedReg.area],
                ["Sức chứa", `${selectedReg.capacity} người`],
                ["Mức giá", selectedReg.priceRange],
                ["Phòng dự kiến", selectedReg.roomName],
                ["Lịch hẹn", selectedReg.appointmentAt ? new Date(selectedReg.appointmentAt).toLocaleString("vi-VN") : "Chưa gửi"],
                ["Ngày đăng ký", new Date(selectedReg.createdAt).toLocaleDateString("vi-VN")],
                ...(selectedReg.note ? [["Ghi chú", selectedReg.note]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              {selectedReg.status === "moi" && !selectedReg.appointmentSent ? (
                <button
                  onClick={() => { setSelectedRegForAssign(selectedReg); setSelectedReg(null); setSelectedRoomForAssign(vacantRooms.find((room) => room.roomId === selectedReg.roomId) ?? null); }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Sắp lịch xem phòng
                </button>
              ) : (
                !selectedReg.appointmentSent && selectedReg.status === "moi" && (
                  <button onClick={() => { handleSendAppointment(selectedReg.applicationId, selectedReg.roomId ?? ""); setSelectedReg(null); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Gửi lịch hẹn
                  </button>
                )
              )}
              <button onClick={() => setSelectedReg(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Room Assignment & Schedule Booking Wizard ── */}
      {selectedRegForAssign && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0 bg-white z-10">
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
                    <p><strong>Giới tính khách:</strong> {selectedRegForAssign.gender || "Chưa rõ"}</p>
                    <p><strong>Khu vực:</strong> {selectedRegForAssign.area}</p>
                    <p><strong>Sức chứa:</strong> {selectedRegForAssign.capacity} người</p>
                    <p><strong>Mức giá:</strong> {selectedRegForAssign.priceRange}</p>
                  </div>
                </div>

                {selectedRoomForAssign ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-800 border-b pb-1">Kết quả đối chiếu điều kiện cho thuê</h3>

                    {/* Comparisons */}
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
                          match: !selectedRoomForAssign.allowedGender ||
                            !selectedRegForAssign.gender ||
                            selectedRoomForAssign.allowedGender.toLowerCase() === "khong_gioi_han" ||
                            (selectedRegForAssign.gender === "Nam" && selectedRoomForAssign.allowedGender.toLowerCase() === "nam") ||
                            (selectedRegForAssign.gender === "Nữ" && selectedRoomForAssign.allowedGender.toLowerCase() === "nu")
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
                        }
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

                    {/* Mismatch warnings */}
                    {!(
                      selectedRegForAssign.area === selectedRoomForAssign.area &&
                      selectedRegForAssign.capacity <= selectedRoomForAssign.capacity
                    ) ? (
                      <div className="p-3 bg-red-100 border border-red-200 rounded-xl space-y-3">
                        <div className="flex gap-1.5 text-xs text-red-800 font-bold items-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Cảnh báo: Khách thuê không thỏa mãn điều kiện thuê! (A5)</span>
                        </div>
                        <p className="text-[11px] text-red-700">Thông tin đối chiếu của khách không khớp với điều kiện cho thuê của phòng này. Hãy chọn lại phòng khác phù hợp hơn.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRoomForAssign(null)}
                            className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold"
                          >
                            Chọn lại phòng khác
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Confirm form */
                      <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="font-bold text-xs text-gray-700 uppercase">Lên lịch hẹn xem phòng</p>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian xem phòng dự kiến <span className="text-red-500">*</span></label>
                          <input
                            type="datetime-local"
                            value={assignAppointmentDate}
                            onChange={e => setAssignAppointmentDate(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú lịch hẹn</label>
                          <input
                            type="text"
                            placeholder="Vd: Xem vào buổi sáng..."
                            value={assignAppointmentNote}
                            onChange={e => setAssignAppointmentNote(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={async () => {
                              if (!assignAppointmentDate) { toast.warning("Vui lòng chọn ngày giờ hẹn xem phòng."); return; }
                              try {
                                await salesApi.createSchedule(selectedRegForAssign.applicationId, {
                                  roomId: selectedRoomForAssign.roomId,
                                  appointmentAt: new Date(assignAppointmentDate).toISOString(),
                                  note: assignAppointmentNote
                                });
                                setSelectedRegForAssign(null);
                                toast.success(`Lên lịch hẹn thành công!\nHệ thống tự động gửi thông báo lịch xem phòng đến khách hàng.`);
                                await loadData();
                              } catch (err) {
                                toast.error("Không thể sắp lịch xem phòng.");
                              }
                            }}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors"
                          >
                            Xác nhận & Gửi lịch hẹn
                          </button>
                          <button
                            onClick={() => setSelectedRoomForAssign(null)}
                            className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700"
                          >
                            Chọn lại
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-blue-600" />
                    <p className="text-xs font-medium">Chọn một phòng ở danh sách bên phải để đối chiếu điều kiện thuê (Khu vực, Giới tính, Sức chứa, Mức giá)</p>
                  </div>
                )}
              </div>

              {/* Right: Room search and select */}
              <div className="w-full md:w-96 p-6 bg-gray-50 flex flex-col border-t md:border-t-0 md:border-l border-gray-150 max-h-[50vh] md:max-h-none">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-950 text-sm">Danh sách phòng trống</h3>
                </div>

                {/* Filters */}
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

                {/* Room list */}
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
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${selectedRoomForAssign?.roomId === room.roomId ? "bg-blue-100 border-blue-400 shadow-sm" : "bg-white border-gray-200 hover:border-gray-300"}`}
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
        confirmLabel="Xác nhận"
        variant="info"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

