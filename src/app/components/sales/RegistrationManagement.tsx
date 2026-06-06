import { useState, useEffect } from "react";
import { Users, Calendar, CheckCircle, Eye, Plus, X, Send, Search, ArrowRight, Building2, AlertTriangle } from "lucide-react";

interface Registration {
  id: number;
  regId: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  area: string;
  capacity: number;
  priceRange: string;
  room: string;
  appointmentDate: string;
  appointmentSent: boolean;
  status: string;
  submittedDate: string;
  note: string;
}

const mockRooms = [
  { id: 1, name: "Phòng 201", building: "Tòa A", floor: "Tầng 2", type: "Giường đơn", capacity: 1, price: 1800000, status: "Trống", area: "Khu A", gender: "Nam" },
  { id: 2, name: "Phòng 305", building: "Tòa B", floor: "Tầng 3", type: "Giường đôi", capacity: 2, price: 2400000, status: "Trống", area: "Khu B", gender: "Nữ" },
  { id: 3, name: "Phòng 102", building: "Tòa C", floor: "Tầng 1", type: "Giường đơn", capacity: 1, price: 2000000, status: "Đang thuê", area: "Khu A", gender: "Nam" },
  { id: 4, name: "Phòng 404", building: "Tòa A", floor: "Tầng 4", type: "Phòng chia sẻ", capacity: 4, price: 1200000, status: "Đang giữ chỗ", area: "Khu B", gender: "Nữ" },
  { id: 5, name: "Phòng 203", building: "Tòa A", floor: "Tầng 2", type: "Giường đơn", capacity: 1, price: 1800000, status: "Bảo trì", area: "Khu A", gender: "Nam" },
  { id: 6, name: "Phòng 501", building: "Tòa C", floor: "Tầng 5", type: "Phòng chia sẻ", capacity: 6, price: 1000000, status: "Trống", area: "Khu C", gender: "Nữ" },
];

export function RegistrationManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", gender: "Nam", area: "Khu A", capacity: "1", priceRange: "1.5 – 2 triệu", note: "" });
  
  // Room assignment states
  const [selectedRegForAssign, setSelectedRegForAssign] = useState<Registration | null>(null);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState<any | null>(null);
  const [assignFilterArea, setAssignFilterArea] = useState("all");
  const [assignFilterStatus, setAssignFilterStatus] = useState("Trống");
  const [assignFilterPrice, setAssignFilterPrice] = useState("all");
  const [assignAppointmentDate, setAssignAppointmentDate] = useState("");
  const [assignAppointmentNote, setAssignAppointmentNote] = useState("");

  const [regs, setRegs] = useState<Registration[]>(() => {
    const saved = localStorage.getItem("roommanager_registrations");
    return saved ? JSON.parse(saved) : [
      { id: 1, regId: "DK-2026-0514-001", name: "Nguyễn Văn B", phone: "0901234567", email: "nguyenb@email.com", gender: "Nam", area: "Khu A", capacity: 1, priceRange: "1.5 – 2 triệu", room: "Phòng 201 – Tòa A", appointmentDate: "20/05/2026 09:00", appointmentSent: true, status: "Đã gửi lịch hẹn", submittedDate: "14/05/2026", note: "Khách muốn xem phòng buổi sáng" },
      { id: 2, regId: "DK-2026-0513-002", name: "Trần Thị C", phone: "0912345678", email: "tranc@email.com", gender: "Nữ", area: "Khu B", capacity: 2, priceRange: "Trên 2 triệu", room: "Chưa phân phòng", appointmentDate: "", appointmentSent: false, status: "Chờ xác nhận lịch", submittedDate: "13/05/2026", note: "" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("roommanager_registrations", JSON.stringify(regs));
  }, [regs]);

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email) { alert("Vui lòng điền đủ thông tin bắt buộc."); return; }
    const newReg: Registration = {
      id: regs.length + 1,
      regId: `DK-2026-${String(Date.now()).slice(-4)}-${String(regs.length + 1).padStart(3, "0")}`,
      name: form.name, phone: form.phone, email: form.email, gender: form.gender,
      area: form.area, capacity: parseInt(form.capacity), priceRange: form.priceRange,
      room: "Chưa phân phòng", appointmentDate: "", appointmentSent: false,
      status: "Chờ xác nhận lịch", submittedDate: new Date().toLocaleDateString("vi-VN"), note: form.note,
    };
    setRegs(prev => [newReg, ...prev]);
    setForm({ name: "", phone: "", email: "", gender: "Nam", area: "Khu A", capacity: "1", priceRange: "1.5 – 2 triệu", note: "" });
    setShowForm(false);
    alert(`Đã ghi nhận đăng ký cho ${newReg.name}.\nMã đăng ký: ${newReg.regId}`);
  };

  const handleSendAppointment = (id: number) => {
    setRegs(prev => prev.map(r => r.id === id ? { ...r, appointmentSent: true, appointmentDate: "22/05/2026 10:00", status: "Đã gửi lịch hẹn" } : r));
    alert("Đã gửi lịch hẹn xem phòng đến email/SĐT khách hàng.");
  };

  const filtered = regs.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.regId.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  const statusColor: Record<string, string> = {
    "Đã gửi lịch hẹn": "bg-green-100 text-green-700",
    "Chờ xác nhận lịch": "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Tiếp nhận đăng ký thuê phòng</h1>
          <p className="text-sm text-gray-500">Ghi nhận thông tin khách hàng và gửi lịch hẹn xem phòng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tổng đăng ký", value: regs.length, color: "text-gray-900" },
          { label: "Đã gửi lịch hẹn", value: regs.filter(r=>r.appointmentSent).length, color: "text-green-700" },
          { label: "Chờ xác nhận lịch", value: regs.filter(r=>!r.appointmentSent).length, color: "text-orange-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm theo tên khách, mã đăng ký, SĐT..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map(reg => (
            <div key={reg.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.name}</h3>
                      <p className="text-xs text-gray-500">{reg.phone} · {reg.email}</p>
                      <p className="text-xs text-gray-400">Mã ĐK: {reg.regId} · {reg.submittedDate}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ml-13">
                    <div><p className="text-gray-400">Khu vực</p><p className="font-medium text-gray-800">{reg.area}</p></div>
                    <div><p className="text-gray-400">Giới tính</p><p className="font-medium text-gray-800">{reg.gender}</p></div>
                    <div><p className="text-gray-400">Sức chứa</p><p className="font-medium text-gray-800">{reg.capacity} người</p></div>
                    <div><p className="text-gray-400">Mức giá</p><p className="font-medium text-gray-800">{reg.priceRange}</p></div>
                  </div>
                  {reg.appointmentDate && (
                    <div className="mt-2 ml-13 flex items-center gap-1 text-xs text-green-700">
                      <Calendar className="w-3 h-3" /> Lịch hẹn: {reg.appointmentDate}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[reg.status] ?? "bg-gray-105 text-gray-600"}`}>{reg.status}</span>
                  {reg.room === "Chưa phân phòng" && reg.status !== "Đã hủy" ? (
                    <button 
                      onClick={() => { setSelectedRegForAssign(reg); setSelectedRoomForAssign(null); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" /> Phân phòng & Đối chiếu
                    </button>
                  ) : (
                    !reg.appointmentSent && reg.status !== "Đã hủy" && (
                      <button onClick={() => handleSendAppointment(reg.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                        <Send className="w-3 h-3" /> Gửi lịch hẹn
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

      {/* Modal: Nhận đăng ký mới */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Nhập thông tin đăng ký thuê</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Thông tin khách hàng</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e=>f("name",e.target.value)} placeholder="Nhập họ tên khách hàng" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                    <input value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="09xxxxxxxx" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select value={form.gender} onChange={e=>f("gender",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Nam</option><option>Nữ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input value={form.email} onChange={e=>f("email",e.target.value)} placeholder="email@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide pt-2">Yêu cầu thuê</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <select value={form.area} onChange={e=>f("area",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Khu A</option><option>Khu B</option><option>Khu C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số người</label>
                  <select value={form.capacity} onChange={e=>f("capacity",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="1">1 người</option><option value="2">2 người</option><option value="4">4 người</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá mong muốn (VNĐ/tháng)</label>
                  <select value={form.priceRange} onChange={e=>f("priceRange",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Dưới 1.5 triệu</option><option>1.5 – 2 triệu</option><option>Trên 2 triệu</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={form.note} onChange={e=>f("note",e.target.value)} rows={2} placeholder="Yêu cầu đặc biệt, thời gian xem phòng mong muốn..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
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
                ["Mã đăng ký", selectedReg.regId],
                ["Trạng thái", selectedReg.status],
                ["Khách hàng", selectedReg.name],
                ["Điện thoại", selectedReg.phone],
                ["Email", selectedReg.email],
                ["Giới tính", selectedReg.gender],
                ["Khu vực yêu cầu", selectedReg.area],
                ["Sức chứa", `${selectedReg.capacity} người`],
                ["Mức giá", selectedReg.priceRange],
                ["Phòng dự kiến", selectedReg.room],
                ["Lịch hẹn", selectedReg.appointmentDate || "Chưa gửi"],
                ["Ngày đăng ký", selectedReg.submittedDate],
                ...(selectedReg.note ? [["Ghi chú", selectedReg.note]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="font-medium text-gray-900 text-right">{v}</span>
                </div>
              ))}
            </div>
             <div className="px-6 pb-6 flex gap-3">
              {selectedReg.room === "Chưa phân phòng" && selectedReg.status !== "Đã hủy" ? (
                <button 
                  onClick={() => { setSelectedRegForAssign(selectedReg); setSelectedReg(null); setSelectedRoomForAssign(null); }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> Phân phòng & Đối chiếu
                </button>
              ) : (
                !selectedReg.appointmentSent && selectedReg.status !== "Đã hủy" && (
                  <button onClick={() => { handleSendAppointment(selectedReg.id); setSelectedReg(null); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Gửi lịch hẹn
                  </button>
                )
              )}
              <button onClick={() => setSelectedReg(null)} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Room Assignment & Comparison Wizard (UC Tiếp nhận đăng ký) ── */}
      {selectedRegForAssign && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Phân phòng & Đối chiếu điều kiện</h2>
                <p className="text-xs text-gray-500">Mã ĐK: {selectedRegForAssign.regId}</p>
              </div>
              <button onClick={() => setSelectedRegForAssign(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Left: Registration Details & Comparison */}
              <div className="flex-1 p-6 border-r border-gray-100 space-y-4 overflow-y-auto">

              {/* Registration summary card */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                <p className="font-semibold text-blue-900 uppercase">Yêu cầu của khách: {selectedRegForAssign.name}</p>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <p><strong>Giới tính:</strong> {selectedRegForAssign.gender}</p>
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
                        roomVal: selectedRoomForAssign.area,
                        match: selectedRegForAssign.area === selectedRoomForAssign.area,
                      },
                      {
                        label: "Giới tính quy định",
                        req: selectedRegForAssign.gender,
                        roomVal: selectedRoomForAssign.gender,
                        match: selectedRegForAssign.gender === selectedRoomForAssign.gender,
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
                        roomVal: `${selectedRoomForAssign.price.toLocaleString("vi-VN")} đ`,
                        match: (() => {
                          const price = selectedRoomForAssign.price;
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

                  {/* Flow A5 Mismatch alert */}
                  {!(
                    selectedRegForAssign.area === selectedRoomForAssign.area &&
                    selectedRegForAssign.gender === selectedRoomForAssign.gender &&
                    selectedRegForAssign.capacity <= selectedRoomForAssign.capacity &&
                    (() => {
                      const price = selectedRoomForAssign.price;
                      if (selectedRegForAssign.priceRange === "Dưới 1.5 triệu") return price <= 1500000;
                      if (selectedRegForAssign.priceRange === "1.5 – 2 triệu") return price > 1500000 && price <= 2000000;
                      return price > 2000000;
                    })()
                  ) ? (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-xl space-y-3">
                      <div className="flex gap-1.5 text-xs text-red-855 font-bold items-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Cảnh báo: Khách thuê không thỏa mãn điều kiện thuê! (A5)</span>
                      </div>
                      <p className="text-[11px] text-red-700">Thông tin đối chiếu của khách không khớp với điều kiện cho thuê của phòng này. Hãy tư vấn khách đổi tiêu chí hoặc hủy đăng ký.</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedRoomForAssign(null)}
                          className="px-3 py-1.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold"
                        >
                          Tư vấn đổi tiêu chí (Chọn lại phòng khác)
                        </button>
                        <button 
                          onClick={() => {
                            setRegs(p => p.map(r => r.id === selectedRegForAssign.id ? { ...r, status: "Đã hủy", room: "Đã hủy do không khớp ĐK" } : r));
                            setSelectedRegForAssign(null);
                            alert("Đã hủy yêu cầu đăng ký thuê theo phản hồi của khách hàng.");
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Hủy yêu cầu đăng ký (Kết thúc UC)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Confirm form */
                    <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="font-bold text-xs text-gray-700 uppercase">Lên lịch hẹn & Ghi nhận (Bước 6, 7)</p>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian xem phòng dự kiến <span className="text-red-500">*</span></label>
                        <input 
                          type="datetime-local" 
                          value={assignAppointmentDate} 
                          onChange={e => setAssignAppointmentDate(e.target.value)} 
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú lịch hẹn</label>
                        <input 
                          type="text" 
                          placeholder="Vd: Xem vào buổi sáng..." 
                          value={assignAppointmentNote} 
                          onChange={e => setAssignAppointmentNote(e.target.value)} 
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            if (!assignAppointmentDate) { alert("Vui lòng chọn ngày giờ hẹn xem phòng."); return; }
                            const formattedDate = new Date(assignAppointmentDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
                            setRegs(p => p.map(r => r.id === selectedRegForAssign.id 
                              ? { 
                                  ...r, 
                                  room: `${selectedRoomForAssign.name} – ${selectedRoomForAssign.building}`,
                                  appointmentDate: formattedDate,
                                  appointmentSent: true,
                                  status: "Đã gửi lịch hẹn",
                                  note: assignAppointmentNote || r.note
                                }
                              : r
                            ));
                            setSelectedRegForAssign(null);
                            alert(`Ghi nhận đăng ký thành công!\nMã đăng ký: ${selectedRegForAssign.regId}\nHệ thống tự động gửi thông báo lịch hẹn xem phòng (${formattedDate}) đến email/số điện thoại của khách hàng.`);
                          }}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          Xác nhận ghi nhận & Gửi lịch hẹn
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
                {mockRooms
                  .filter(r => {
                    const matchArea = assignFilterArea === "all" || r.area === assignFilterArea;
                    const matchStatus = r.status === "Trống";
                    const matchPrice = assignFilterPrice === "all" || 
                      (assignFilterPrice === "low" && r.price <= 1500000) ||
                      (assignFilterPrice === "mid" && r.price > 1500000 && r.price <= 2000000) ||
                      (assignFilterPrice === "high" && r.price > 2000000);
                    return matchArea && matchStatus && matchPrice;
                  })
                  .map(room => (
                    <div 
                      key={room.id} 
                      onClick={() => setSelectedRoomForAssign(room)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${selectedRoomForAssign?.id === room.id ? "bg-blue-100 border-blue-400 shadow-sm" : "bg-white border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-gray-950">{room.name} – {room.building}</p>
                          <p className="text-[10px] text-gray-500">{room.area} · Sức chứa: {room.capacity} người · Cho: {room.gender}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700">{room.price.toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}
