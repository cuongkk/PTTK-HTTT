import { useState } from "react";
import { Building2, MapPin, DollarSign, Users, CheckCircle, Clock, AlertTriangle, Search, Filter, X } from "lucide-react";

export function RoomManagement() {
  const [filterStatus, setFilterStatus] = useState("Trống");
  const [filterArea, setFilterArea] = useState("all");
  const [filterCapacity, setFilterCapacity] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const rooms = [
    { id: 1, name: "Phòng 201", building: "Tòa A", floor: "Tầng 2", type: "Giường đơn", capacity: 1, price: 1800000, status: "Trống", area: "Khu A", gender: "Nam", lastUpdated: "10/05/2026" },
    { id: 2, name: "Phòng 305", building: "Tòa B", floor: "Tầng 3", type: "Giường đôi", capacity: 2, price: 2400000, status: "Trống", area: "Khu B", gender: "Nữ", lastUpdated: "12/05/2026" },
    { id: 3, name: "Phòng 102", building: "Tòa C", floor: "Tầng 1", type: "Giường đơn", capacity: 1, price: 2000000, status: "Đang thuê", area: "Khu A", gender: "Nam", tenant: "Nguyễn Văn A", lastUpdated: "15/01/2026" },
    { id: 4, name: "Phòng 404", building: "Tòa A", floor: "Tầng 4", type: "Phòng chia sẻ", capacity: 4, price: 1200000, status: "Đang giữ chỗ", area: "Khu B", gender: "Nữ", lastUpdated: "13/05/2026" },
    { id: 5, name: "Phòng 203", building: "Tòa A", floor: "Tầng 2", type: "Giường đơn", capacity: 1, price: 1800000, status: "Bảo trì", area: "Khu A", gender: "Nam", lastUpdated: "08/05/2026" },
    { id: 6, name: "Phòng 501", building: "Tòa C", floor: "Tầng 5", type: "Phòng chia sẻ", capacity: 6, price: 1000000, status: "Trống", area: "Khu C", gender: "Nữ", lastUpdated: "14/05/2026" },
  ];

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    "Trống":         { icon: CheckCircle,   color: "text-green-700",  bg: "bg-green-100" },
    "Đang thuê":     { icon: Users,         color: "text-blue-700",   bg: "bg-blue-100" },
    "Đang giữ chỗ": { icon: Clock,         color: "text-orange-700", bg: "bg-orange-100" },
    "Bảo trì":       { icon: AlertTriangle, color: "text-red-700",    bg: "bg-red-100" },
  };

  const statuses = ["all", "Trống", "Đang thuê", "Đang giữ chỗ", "Bảo trì"];
  const areas    = ["all", "Khu A", "Khu B", "Khu C"];

  const filtered = rooms.filter(r => {
    const matchStatus   = filterStatus   === "all" || r.status === filterStatus;
    const matchArea     = filterArea     === "all" || r.area   === filterArea;
    const matchCapacity = filterCapacity === "all" || (filterCapacity === "1" ? r.capacity === 1 : r.capacity > 1);
    const matchPrice    = filterPrice    === "all"
      || (filterPrice === "low"  && r.price <= 1500000)
      || (filterPrice === "mid"  && r.price > 1500000 && r.price <= 2000000)
      || (filterPrice === "high" && r.price > 2000000);
    const matchSearch   = r.name.toLowerCase().includes(search.toLowerCase())
      || r.building.toLowerCase().includes(search.toLowerCase())
      || r.area.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchArea && matchCapacity && matchPrice && matchSearch;
  });

  const counts = { total: rooms.length, available: rooms.filter(r => r.status === "Trống").length };

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
          { label: "Còn trống",         value: counts.available, color: "text-green-700" },
          { label: "Đang giữ chỗ",     value: rooms.filter(r=>r.status==="Đang giữ chỗ").length, color: "text-orange-700" },
          { label: "Đang thuê",         value: rooms.filter(r=>r.status==="Đang thuê").length, color: "text-blue-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên phòng, tòa nhà, khu vực..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              {statuses.map(s => <option key={s} value={s}>{s === "all" ? "Tất cả" : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Khu vực</label>
            <select value={filterArea} onChange={e=>setFilterArea(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              {areas.map(a => <option key={a} value={a}>{a === "all" ? "Tất cả" : a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sức chứa</label>
            <select value={filterCapacity} onChange={e=>setFilterCapacity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">Tất cả</option>
              <option value="1">1 người</option>
              <option value="2+">Nhiều người</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mức giá (VNĐ/tháng)</label>
            <select value={filterPrice} onChange={e=>setFilterPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">Tất cả</option>
              <option value="low">Dưới 1.5 triệu</option>
              <option value="mid">1.5 – 2 triệu</option>
              <option value="high">Trên 2 triệu</option>
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
              onClick={() => { setFilterStatus("all"); setFilterArea("all"); setFilterCapacity("all"); setFilterPrice("all"); setSearch(""); }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Đặt lại tất cả bộ lọc (Quay lại bước 2)
            </button>
          </div>
        )}
        {filtered.map(room => {
          const cfg = statusConfig[room.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={room.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{room.name}</h3>
                      <p className="text-xs text-gray-500">{room.building} · {room.floor}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {room.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div><p className="text-gray-400">Khu vực</p><p className="font-medium text-gray-800">{room.area}</p></div>
                  <div><p className="text-gray-400">Giới tính</p><p className="font-medium text-gray-800">{room.gender}</p></div>
                  <div><p className="text-gray-400">Sức chứa</p><p className="font-medium text-gray-800">{room.capacity} người</p></div>
                  <div><p className="text-gray-400">Loại</p><p className="font-medium text-gray-800">{room.type}</p></div>
                  <div className="col-span-2"><p className="text-gray-400">Giá thuê</p><p className="font-semibold text-blue-700">{room.price.toLocaleString("vi-VN")} đ/tháng</p></div>
                </div>

                {room.tenant && (
                  <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                    <span className="font-medium">Người thuê hiện tại:</span> {room.tenant}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Cập nhật: {room.lastUpdated}</p>
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
                alt={selectedRoom.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <h2 className="text-xl font-bold text-white">{selectedRoom.name}</h2>
                <p className="text-xs text-gray-200">{selectedRoom.building} · {selectedRoom.floor} · {selectedRoom.area}</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Trạng thái phòng</p>
                  <p className={`font-semibold ${selectedRoom.status === "Trống" ? "text-green-700" : selectedRoom.status === "Đang giữ chỗ" ? "text-orange-700" : "text-blue-700"}`}>
                    {selectedRoom.status === "Trống" ? "Còn trống (Sẵn sàng đón khách)" : selectedRoom.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Giá thuê phòng</p>
                  <p className="font-bold text-blue-700">{selectedRoom.price.toLocaleString("vi-VN")} đ/tháng</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b pb-1 text-sm">Đặc điểm & Nội thất đi kèm</h3>
                <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <li className="flex items-center gap-1.5">✓ Giường ngủ cao cấp</li>
                  <li className="flex items-center gap-1.5">✓ Tủ quần áo bằng gỗ</li>
                  <li className="flex items-center gap-1.5">✓ Bàn học & ghế tựa</li>
                  <li className="flex items-center gap-1.5">✓ Máy điều hòa 2 chiều</li>
                  <li className="flex items-center gap-1.5">✓ Bình nóng lạnh</li>
                  <li className="flex items-center gap-1.5">✓ Đèn đọc sách & Kệ sách</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 border-b pb-1 text-sm">Dịch vụ & Tiện ích trong khu</h3>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex justify-between"><span>Wifi tốc độ cao</span> <span className="font-medium text-green-700">Miễn phí</span></li>
                  <li className="flex justify-between"><span>Dọn dẹp vệ sinh phòng</span> <span className="font-medium text-gray-700">2 lần/tuần</span></li>
                  <li className="flex justify-between"><span>Giặt ủi quần áo</span> <span className="font-medium text-gray-700">30.000đ/lần</span></li>
                  <li className="flex justify-between"><span>Giữ xe máy nội khu</span> <span className="font-medium text-green-700">Miễn phí (An ninh 24/7)</span></li>
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
