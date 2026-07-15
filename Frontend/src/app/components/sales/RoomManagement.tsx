import { useEffect, useState } from "react";
import { Building2, CheckCircle, Clock, AlertTriangle, Search, X, Users, Wind, ShieldAlert, Car } from "lucide-react";
import { roomService, type Room } from "../../services/system-admin/roomService";
import { serviceCatalogService, type ServiceItem } from "../../services/system-admin/serviceCatalogService";

export function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("Trống");
  const [filterArea, setFilterArea] = useState("all");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [filterAirConditioner, setFilterAirConditioner] = useState("all");
  const [filterParking, setFilterParking] = useState("all");
  const [filterQuiet, setFilterQuiet] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    Promise.all([roomService.getAll(), serviceCatalogService.getAll()])
      .then(([roomsRes, servicesRes]) => {
        setRooms(roomsRes);
        setServices(servicesRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách phòng.");
        setLoading(false);
      });
  }, []);

  const getStatusLabel = (dbStatus: string) => {
    switch (dbStatus) {
      case "trong": return "Trống";
      case "da_dat_coc": return "Đang giữ chỗ";
      case "dang_thue": return "Đang thuê";
      default: return "Bảo trì";
    }
  };

  const getRoomTypeLabel = (dbType: string) => {
    return dbType === "ghep" ? "Giường ở ghép" : "Nguyên căn";
  };

  const getGenderLabel = (dbGender: string | null) => {
    if (!dbGender) return "Không giới hạn";
    if (dbGender.toLowerCase() === "nam") return "Nam";
    if (dbGender.toLowerCase() === "nu" || dbGender.toLowerCase() === "nữ") return "Nữ";
    return "Không giới hạn";
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    "Trống": { icon: CheckCircle, color: "text-green-700", bg: "bg-green-100" },
    "Đang thuê": { icon: Users, color: "text-blue-700", bg: "bg-blue-100" },
    "Đang giữ chỗ": { icon: Clock, color: "text-orange-700", bg: "bg-orange-100" },
    "Bảo trì": { icon: AlertTriangle, color: "text-red-700", bg: "bg-red-100" },
  };

  const statuses = ["all", "Trống", "Đang thuê", "Đang giữ chỗ", "Bảo trì"];

  const mappedRooms = rooms.map(r => ({
    ...r,
    mappedStatus: getStatusLabel(r.status),
    mappedType: getRoomTypeLabel(r.roomType),
    mappedGender: getGenderLabel(r.allowedGender)
  }));

  const filtered = mappedRooms.filter(r => {
    const matchStatus = filterStatus === "all" || r.mappedStatus === filterStatus;
    const matchArea = filterArea === "all" || r.area === filterArea;
    const matchCapacity = filterCapacity === "all" || (filterCapacity === "1" ? r.capacity === 1 : r.capacity > 1);
    const matchPrice = filterPrice === "all"
      || (filterPrice === "low" && (r.roomPrice ?? 0) <= 1500000)
      || (filterPrice === "mid" && (r.roomPrice ?? 0) > 1500000 && (r.roomPrice ?? 0) <= 2000000)
      || (filterPrice === "high" && (r.roomPrice ?? 0) > 2000000);

    const matchGender = filterGender === "all" ||
      (filterGender === "nam" && r.allowedGender?.toLowerCase() === "nam") ||
      (filterGender === "nu" && (r.allowedGender?.toLowerCase() === "nu" || r.allowedGender?.toLowerCase() === "nữ")) ||
      (filterGender === "khong_gioi_han" && (r.allowedGender === null || r.allowedGender === "khong_gioi_han"));

    const matchRoomType = filterRoomType === "all" || r.roomType === filterRoomType;

    const matchAir = filterAirConditioner === "all" ||
      (filterAirConditioner === "yes" && r.hasAirConditioner) ||
      (filterAirConditioner === "no" && !r.hasAirConditioner);

    const matchParking = filterParking === "all" ||
      (filterParking === "yes" && r.hasParking) ||
      (filterParking === "no" && !r.hasParking);

    const matchQuiet = filterQuiet === "all" ||
      (filterQuiet === "yes" && r.requiresQuietLifestyle) ||
      (filterQuiet === "no" && !r.requiresQuietLifestyle);

    const matchSearch = r.roomName.toLowerCase().includes(search.toLowerCase())
      || r.branchName.toLowerCase().includes(search.toLowerCase())
      || (r.area ?? "").toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchArea && matchCapacity && matchPrice && matchSearch &&
      matchGender && matchRoomType && matchAir && matchParking && matchQuiet;
  });

  const counts = {
    total: rooms.length,
    available: mappedRooms.filter(r => r.mappedStatus === "Trống").length,
    holding: mappedRooms.filter(r => r.mappedStatus === "Đang giữ chỗ").length,
    rented: mappedRooms.filter(r => r.mappedStatus === "Đang thuê").length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-500 text-sm">Đang tải danh sách phòng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="font-bold mb-2">Đã xảy ra lỗi</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tra cứu trạng thái phòng/giường</h1>
        <p className="text-gray-500 text-sm">Kiểm tra phòng/giường còn trống và đối chiếu điều kiện thuê của khách hàng</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng phòng/giường", value: counts.total, color: "text-gray-900" },
          { label: "Còn trống", value: counts.available, color: "text-green-700" },
          { label: "Đang giữ chỗ", value: counts.holding, color: "text-orange-700" },
          { label: "Đang thuê", value: counts.rented, color: "text-blue-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên phòng, tòa nhà, khu vực..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Filter row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Trạng thái</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {statuses.map(s => <option key={s} value={s}>{s === "all" ? "Tất cả" : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Khu vực</label>
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              {Array.from(new Set(rooms.map(r => r.area).filter(Boolean))).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Sức chứa</label>
            <select value={filterCapacity} onChange={e => setFilterCapacity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="1">1 người</option>
              <option value="2+">Nhiều người</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Mức giá (VNĐ/tháng)</label>
            <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="low">Dưới 1.5 triệu</option>
              <option value="mid">1.5 – 2 triệu</option>
              <option value="high">Trên 2 triệu</option>
            </select>
          </div>
        </div>

        {/* Filter row 2: Advanced Criteria */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Quy định giới tính</label>
            <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="nam">Chỉ cho Nam</option>
              <option value="nu">Chỉ cho Nữ</option>
              <option value="khong_gioi_han">Không giới hạn</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Loại phòng</label>
            <select value={filterRoomType} onChange={e => setFilterRoomType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="ghep">Ở ghép (Shared)</option>
              <option value="nguyen_can">Nguyên căn (Whole)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Có Máy lạnh</label>
            <select value={filterAirConditioner} onChange={e => setFilterAirConditioner(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="yes">Có</option>
              <option value="no">Không</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Có Chỗ gửi xe</label>
            <select value={filterParking} onChange={e => setFilterParking(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="yes">Có</option>
              <option value="no">Không</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs text-gray-500 mb-1 font-semibold">Yêu cầu yên tĩnh</label>
            <select value={filterQuiet} onChange={e => setFilterQuiet(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="all">Tất cả</option>
              <option value="yes">Có yêu cầu</option>
              <option value="no">Không yêu cầu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-red-500" />
            <p className="font-bold text-gray-700 text-base">Không tìm thấy phòng/giường phù hợp</p>
            <p className="text-sm mt-1 text-gray-500 max-w-md mx-auto">Hệ thống thông báo không có dữ liệu khớp với bộ lọc hiện tại. Vui lòng quay lại điều chỉnh bộ lọc hoặc đặt lại bộ lọc để tra cứu lại.</p>
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterArea("all");
                setFilterCapacity("all");
                setFilterPrice("all");
                setFilterGender("all");
                setFilterRoomType("all");
                setFilterAirConditioner("all");
                setFilterParking("all");
                setFilterQuiet("all");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Đặt lại tất cả bộ lọc (Quay lại bước 2)
            </button>
          </div>
        )}
        {filtered.map(room => {
          const cfg = statusConfig[room.mappedStatus] ?? statusConfig["Bảo trì"];
          const StatusIcon = cfg.icon;
          return (
            <div key={room.roomId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{room.roomName}</h3>
                      <p className="text-xs text-gray-500">{room.branchName} · Tầng {room.floor ?? "1"}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {room.mappedStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div><p className="text-gray-400">Khu vực</p><p className="font-medium text-gray-800">{room.area ?? "Chưa có"}</p></div>
                  <div><p className="text-gray-400">Giới tính</p><p className="font-medium text-gray-800">{room.mappedGender}</p></div>
                  <div><p className="text-gray-400">Sức chứa</p><p className="font-medium text-gray-800">{room.capacity} người</p></div>
                  <div><p className="text-gray-400">Loại</p><p className="font-medium text-gray-800">{room.mappedType}</p></div>
                  <div className="col-span-2"><p className="text-gray-400">Giá thuê</p><p className="font-semibold text-blue-700">{room.roomPrice?.toLocaleString("vi-VN") ?? "0"} đ/tháng</p></div>
                </div>

                {/* Badges for Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {room.hasAirConditioner && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-semibold rounded-md">
                      <Wind className="w-2.5 h-2.5" /> Điều hòa
                    </span>
                  )}
                  {room.hasParking && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold rounded-md">
                      <Car className="w-2.5 h-2.5" /> Chỗ để xe
                    </span>
                  )}
                  {room.requiresQuietLifestyle && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-semibold rounded-md">
                      ✓ Yêu cầu yên tĩnh
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Diện tích: {room.areaSquareMeters ?? "—"} m²</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRoom(room)}
                      className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto pt-[6vh] md:pt-[10vh]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Image Header */}
            <div className="relative h-56 bg-gray-100 flex-shrink-0">
              <img
                src={selectedRoom.capacity === 1
                  ? "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80"
                  : "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80"}
                alt={selectedRoom.roomName}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <h2 className="text-xl font-bold text-white">{selectedRoom.roomName}</h2>
                <p className="text-xs text-gray-200">{selectedRoom.branchName} · Tầng {selectedRoom.floor ?? "1"} · {selectedRoom.area ?? "Chưa rõ"}</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Trạng thái phòng</p>
                  <p className={`font-semibold ${selectedRoom.status === "trong" ? "text-green-700" : selectedRoom.status === "da_dat_coc" ? "text-orange-700" : "text-blue-700"}`}>
                    {selectedRoom.status === "trong" ? "Còn trống (Sẵn sàng đón khách)" : selectedRoom.status === "da_dat_coc" ? "Đang giữ chỗ" : "Đang thuê"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Giá thuê phòng</p>
                  <p className="font-bold text-blue-700">{selectedRoom.roomPrice?.toLocaleString("vi-VN") ?? "0"} đ/tháng</p>
                </div>
              </div>

              {/* Extra DB Fields */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <p className="font-semibold text-gray-700 uppercase">Quy định & Hiện trạng phòng</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <p><strong>Giới tính:</strong> {selectedRoom.mappedGender}</p>
                  <p><strong>Diện tích:</strong> {selectedRoom.areaSquareMeters ?? "—"} m²</p>
                  <p><strong>Máy lạnh:</strong> {selectedRoom.hasAirConditioner ? "Có sẵn" : "Không"}</p>
                  <p><strong>Nơi gửi xe:</strong> {selectedRoom.hasParking ? "Trong nhà" : "Không"}</p>
                  <p><strong>Giờ giới nghiêm:</strong> {selectedRoom.curfewTime ?? "Tự do"}</p>
                  <p><strong>Yêu cầu yên tĩnh:</strong> {selectedRoom.requiresQuietLifestyle ? "Có" : "Không"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b pb-1 text-sm">Đặc điểm & Nội thất đi kèm</h3>
                <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {selectedRoom.amenities.map(a => (
                    <li key={a.amenityId} className="flex items-center gap-1.5">✓ {a.amenityName} ({a.quantity} cái)</li>
                  ))}
                  {selectedRoom.amenities.length === 0 && (
                    <>
                      <li className="flex items-center gap-1.5">✓ Giường ngủ cao cấp</li>
                      <li className="flex items-center gap-1.5">✓ Tủ quần áo bằng gỗ</li>
                      <li className="flex items-center gap-1.5">✓ Bàn học & ghế tựa</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b pb-1 text-sm">Dịch vụ & Tiện ích trong khu</h3>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {services.map(s => (
                    <li key={s.serviceId} className="flex justify-between">
                      <span>{s.serviceName}</span>
                      <span className="font-medium text-blue-750">
                        {s.unitPrice === 0 ? "Miễn phí" : `${s.unitPrice.toLocaleString("vi-VN")} đ/${s.unit}`}
                      </span>
                    </li>
                  ))}
                  {services.length === 0 && (
                    <>
                      <li className="flex justify-between"><span>Wifi tốc độ cao</span> <span className="font-medium text-green-700">Miễn phí</span></li>
                      <li className="flex justify-between"><span>Dọn dẹp vệ sinh phòng</span> <span className="font-medium text-gray-700">2 lần/tuần</span></li>
                      <li className="flex justify-between"><span>Giữ xe máy nội khu</span> <span className="font-medium text-green-700">Miễn phí (An ninh 24/7)</span></li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex-1 py-2 border border-gray-350 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors text-center"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
