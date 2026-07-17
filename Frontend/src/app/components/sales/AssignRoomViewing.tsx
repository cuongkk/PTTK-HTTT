import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  X, ArrowLeft, Building2, AlertTriangle, Calendar, CheckCircle, Search, Sparkles
} from "lucide-react";
import { salesApi, type SalesApplication } from "../../services/sales/salesApi";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { toast } from "sonner";

export function AssignRoomViewing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reg, setReg] = useState<SalesApplication | null>(null);
  const [vacantRooms, setVacantRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [areas, setAreas] = useState<string[]>([]);

  // Search & Filter state
  const [filterArea, setFilterArea] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  // Form state
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentNote, setAppointmentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const regRef = new URLSearchParams(location.search).get("regRef");

  const backToDashboard = () => {
    navigate("/sales/registrations?tab=registrations");
  };

  const loadData = useCallback(async () => {
    if (!regRef) {
      setError("Thiếu mã hồ sơ đăng ký tham chiếu.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [applications, roomsData] = await Promise.all([
        salesApi.getApplications().catch(() => [] as SalesApplication[]),
        roomService.getAll().catch(() => [] as Room[]),
      ]);

      const foundReg = applications.find(
        (item) => item.applicationId.toLowerCase() === regRef.toLowerCase()
      );

      if (!foundReg) {
        setError("Không tìm thấy hồ sơ đăng ký yêu cầu.");
        setLoading(false);
        return;
      }

      setReg(foundReg);

      const distinctAreas = Array.from(
        new Set(roomsData.map((r) => r.area).filter(Boolean))
      ) as string[];
      setAreas(distinctAreas);

      const emptyRooms = roomsData.filter((r) => 
        (r.roomType === "nguyen_can" && r.status === "trong") ||
        (r.roomType === "ghep" && r.beds && r.beds.some((b) => b.status === "trong"))
      );
      setVacantRooms(emptyRooms);

      // Pre-select matching room if application has one already suggested
      if (foundReg.roomId) {
        const matchingRoom = emptyRooms.find((r) => r.roomId === foundReg.roomId);
        if (matchingRoom) {
          setSelectedRoom(matchingRoom);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải thông tin phân phòng và sắp lịch.");
    } finally {
      setLoading(false);
    }
  }, [regRef]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmSchedule = async () => {
    if (!reg || !selectedRoom) return;
    if (!appointmentDate) {
      toast.warning("Vui lòng chọn ngày giờ hẹn xem phòng.");
      return;
    }

    try {
      setSubmitting(true);
      await salesApi.createSchedule(reg.applicationId, {
        roomId: selectedRoom.roomId,
        // Lịch xem là mốc giờ địa phương do Sale nhập, không phải thời điểm UTC.
        appointmentAt: appointmentDate,
        note: appointmentNote,
      });

      toast.success(
        "Lên lịch hẹn thành công!\nHệ thống tự động gửi thông báo lịch xem phòng đến khách hàng."
      );
      backToDashboard();
    } catch (err: any) {
      toast.error(err.message || "Không thể sắp lịch xem phòng.");
    } finally {
      setSubmitting(false);
    }
  };

  // Condition checks helpers
  const checkAreaMatch = reg && selectedRoom ? reg.area === selectedRoom.area : false;

  const checkGenderMatch = reg && selectedRoom
    ? !selectedRoom.allowedGender ||
      !reg.gender ||
      selectedRoom.allowedGender.toLowerCase() === "khong_gioi_han" ||
      (reg.gender === "Nam" && selectedRoom.allowedGender.toLowerCase() === "nam") ||
      (reg.gender === "Nữ" && selectedRoom.allowedGender.toLowerCase() === "nu")
    : false;

  const checkCapacityMatch = reg && selectedRoom
    ? (() => {
        const availableBeds = selectedRoom.roomType === "ghep"
          ? (selectedRoom.beds?.filter((b) => b.status === "trong").length ?? 0)
          : selectedRoom.capacity;
        return reg.capacity <= availableBeds;
      })()
    : false;

  const checkPriceMatch = reg && selectedRoom
    ? (() => {
        const roomPrice = selectedRoom.roomPrice ?? 0;
        const price = selectedRoom.roomType === "ghep" && selectedRoom.capacity > 0
          ? roomPrice / selectedRoom.capacity
          : roomPrice;

        const min = reg.minimumPrice;
        const max = reg.maximumPrice;

        if (min !== null && min !== undefined && price < min) return false;
        if (max !== null && max !== undefined && price > max) return false;
        return true;
      })()
    : false;

  const isEligible = checkAreaMatch && checkCapacityMatch;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Đang tải thông tin phân phòng...
      </div>
    );
  }

  if (error || !reg) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-500" />
        <p className="font-semibold text-lg">{error || "Hồ sơ không khả dụng"}</p>
        <button
          onClick={backToDashboard}
          className="mt-4 px-4 py-2 bg-white border border-red-300 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Phân phòng & Sắp lịch xem phòng</h1>
          <p className="text-sm text-gray-500">Mã đăng ký: <span className="font-mono font-semibold text-gray-700">{reg.applicationId}</span></p>
        </div>
        <button
          onClick={backToDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại hồ sơ đăng ký
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[550px]">
        {/* Left Column: Requirements & Verification */}
        <div className="flex-1 space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
            <h3 className="font-bold text-xs uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Yêu cầu của khách: {reg.customerName}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-gray-700">
              <div><span className="text-gray-400">Giới tính:</span> <span className="font-semibold">{reg.gender || "Chưa rõ"}</span></div>
              <div><span className="text-gray-400">Khu vực:</span> <span className="font-semibold">{reg.area || "Chưa rõ"}</span></div>
              <div><span className="text-gray-400">Sức chứa:</span> <span className="font-semibold">{reg.capacity} người</span></div>
              <div><span className="text-gray-400">Mức giá:</span> <span className="font-semibold">{reg.priceRange}</span></div>
              {reg.note && <div className="col-span-2"><span className="text-gray-400">Yêu cầu khác:</span> <span className="font-medium">{reg.note}</span></div>}
            </div>
          </div>

          {selectedRoom ? (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-gray-800 border-b pb-1.5">Kết quả đối chiếu điều kiện cho thuê</h3>
              <div className="space-y-2.5">
                {[
                  {
                    label: "Khu vực địa lý",
                    req: reg.area,
                    roomVal: selectedRoom.area ?? "Chưa rõ",
                    match: checkAreaMatch,
                  },
                  {
                    label: "Giới tính khách / Phòng cho phép",
                    req: reg.gender || "Chưa rõ",
                    roomVal:
                      selectedRoom.allowedGender === "nam"
                        ? "Nam"
                        : selectedRoom.allowedGender === "nu"
                        ? "Nữ"
                        : "Không giới hạn",
                    match: checkGenderMatch,
                  },
                  {
                    label: selectedRoom.roomType === "ghep" ? "Giường trống" : "Sức chứa tối đa",
                    req: `${reg.capacity} người`,
                    roomVal: selectedRoom.roomType === "ghep"
                      ? `${selectedRoom.beds?.filter((b) => b.status === "trong").length ?? 0} giường trống`
                      : `${selectedRoom.capacity} người`,
                    match: checkCapacityMatch,
                  },
                  {
                    label: "Mức giá thuê đề xuất",
                    req: reg.priceRange,
                    roomVal: selectedRoom.roomType === "ghep"
                      ? `${((selectedRoom.roomPrice ?? 0) / (selectedRoom.capacity || 1)).toLocaleString("vi-VN")} đ/giường (Tổng: ${selectedRoom.roomPrice?.toLocaleString("vi-VN") ?? "0"} đ)`
                      : `${selectedRoom.roomPrice?.toLocaleString("vi-VN") ?? "0"} đ`,
                    match: checkPriceMatch,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex justify-between items-center p-3 rounded-xl border ${
                      item.match
                        ? "bg-green-50/60 border-green-200 text-green-800"
                        : "bg-red-50/60 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-bold">{item.label}</p>
                      <p className="opacity-75 mt-0.5">Khách cần: {item.req} · Phòng có: {item.roomVal}</p>
                    </div>
                    <span className="font-bold text-xs shrink-0 pl-2">
                      {item.match ? "✓ Thỏa mãn" : "✗ Không khớp"}
                    </span>
                  </div>
                ))}
              </div>

              {!isEligible ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <div className="flex gap-2 text-xs text-red-800 font-bold items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Cảnh báo: Phòng không thỏa mãn điều kiện tối thiểu!</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Khu vực hoặc sức chứa của phòng đã chọn không thỏa mãn yêu cầu tối thiểu của hồ sơ đăng ký. Hãy chọn lại phòng khác phù hợp từ danh sách bên phải.
                  </p>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="px-3.5 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Chọn lại phòng khác
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                  <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-600" /> Sắp lịch hẹn xem phòng
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Thời gian xem phòng dự kiến <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Ghi chú lịch hẹn
                      </label>
                      <input
                        type="text"
                        placeholder="Vd: Khách xem vào buổi sáng..."
                        value={appointmentNote}
                        onChange={(e) => setAppointmentNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleConfirmSchedule}
                      disabled={submitting}
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {submitting ? "Đang xử lý..." : "Xác nhận & Gửi lịch hẹn"}
                    </button>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700"
                    >
                      Hủy chọn
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-35 text-blue-600 animate-pulse" />
              <p className="text-xs font-semibold">Chọn một phòng ở danh sách bên phải để đối chiếu điều kiện thuê</p>
            </div>
          )}
        </div>

        {/* Right Column: Vacant Rooms Listing */}
        <div className="w-full lg:w-[420px] p-5 bg-gray-50 flex flex-col border border-gray-200 rounded-2xl shadow-sm max-h-[600px] lg:max-h-none">
          <div className="flex-shrink-0 mb-4">
            <h3 className="font-bold text-gray-950 text-sm mb-3">Danh sách phòng trống</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Khu vực</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="all">Tất cả</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Mức giá</label>
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="low">Dưới 1.5 triệu</option>
                  <option value="mid">1.5 – 2 triệu</option>
                  <option value="high">Trên 2 triệu</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {vacantRooms.filter((r) => {
              const matchArea = filterArea === "all" || r.area === filterArea;
              const matchPrice =
                filterPrice === "all" ||
                (filterPrice === "low" && (r.roomPrice ?? 0) <= 1500000) ||
                (filterPrice === "mid" &&
                  (r.roomPrice ?? 0) > 1500000 &&
                  (r.roomPrice ?? 0) <= 2000000) ||
                (filterPrice === "high" && (r.roomPrice ?? 0) > 2000000);
              return matchArea && matchPrice;
            }).length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Không tìm thấy phòng trống phù hợp bộ lọc.
              </div>
            ) : (
              vacantRooms
                .filter((r) => {
                  const matchArea = filterArea === "all" || r.area === filterArea;
                  const matchPrice =
                    filterPrice === "all" ||
                    (filterPrice === "low" && (r.roomPrice ?? 0) <= 1500000) ||
                    (filterPrice === "mid" &&
                      (r.roomPrice ?? 0) > 1500000 &&
                      (r.roomPrice ?? 0) <= 2000000) ||
                    (filterPrice === "high" && (r.roomPrice ?? 0) > 2000000);
                  return matchArea && matchPrice;
                })
                .map((room) => (
                  <div
                    key={room.roomId}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      selectedRoom?.roomId === room.roomId
                        ? "bg-blue-100/70 border-blue-400 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 truncate">
                          {room.roomName} – {room.branchName}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Khu vực: {room.area ?? "Chưa rõ"} · Cho:{" "}
                          {room.allowedGender === "nam"
                            ? "Nam"
                            : room.allowedGender === "nu"
                            ? "Nữ"
                            : "Mọi giới tính"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-700 shrink-0">
                        {room.roomType === "ghep" && room.capacity > 0
                          ? `${((room.roomPrice ?? 0) / room.capacity).toLocaleString("vi-VN")} đ/giường`
                          : `${room.roomPrice?.toLocaleString("vi-VN")} đ`}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-gray-400 font-medium">
                      <span>
                        {room.roomType === "ghep"
                          ? `Giường trống: ${room.beds?.filter(b => b.status === "trong").length ?? 0}/${room.capacity}`
                          : `Sức chứa: ${room.capacity} người`}
                      </span>
                      <span>·</span>
                      <span>{room.roomType === "nguyen_can" ? "Phòng nguyên căn" : "Phòng giường tầng"}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
