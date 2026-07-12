import { useState } from "react";
import { ClipboardList, Building2, Camera, Search, X } from "lucide-react";

export function RoomInspectionConditions() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  // State phục vụ ô tìm kiếm bằng chữ
  const [searchQuery, setSearchQuery] = useState<string>("");

  const rooms = [
    {
      id: 1,
      name: "Phòng 501",
      building: "Tòa C",
      status: "Cần kiểm tra",
      lastInspection: "10/01/2026",
      rentalDay: "08/06/2026",
      tenant: "Emma Wilson",
    },
    {
      id: 2,
      name: "Phòng 203",
      building: "Tòa A",
      status: "Cần kiểm tra",
      lastInspection: "10/01/2026",
      rentalDay: "08/06/2026",
      tenant: "John Smith",
    },
    {
      id: 3,
      name: "Phòng 404",
      building: "Tòa A",
      status: "Cần kiểm tra",
      lastInspection: "08/05/2026",
      rentalDay: "08/06/2026",
      tenant: "Tony Parker",
    },
  ];

  // Logic lọc dữ liệu đa năng: Tìm theo Tên phòng, Tòa nhà, hoặc Tên khách thuê
  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; 

    return (
      room.name.toLowerCase().includes(query) ||
      room.building.toLowerCase().includes(query) ||
      (room.tenant && room.tenant.toLowerCase().includes(query))
    );
  });

  // Tìm phòng đang được chọn để hiển thị thông tin lên Modal
  const currentSelectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra trạng thái phòng</h1>
        <p className="text-gray-600">Kiểm tra trạng thái phòng và lịch sử thuê</p>
      </div>

      {/* Thanh Tìm Kiếm Đa Năng */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo phòng hoặc tên khách..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Số lượng phòng tìm thấy */}
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-semibold text-gray-900">{filteredRooms.length}</span> phòng phù hợp
      </div>

      {/* Room List */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.building}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      room.status === "Tình trạng tốt"
                        ? "bg-green-100 text-green-700"
                        : room.status === "Cần bảo trì"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {room.tenant && (
                    <div className="text-sm">
                      <p className="text-gray-600">Khách thuê hiện tại</p>
                      <p className="font-medium text-gray-900">{room.tenant}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <p className="text-gray-600">Lần kiểm tra cuối</p>
                    <p className="font-medium text-gray-900">{room.lastInspection}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Ngày thuê</p>
                    <p className="font-medium text-gray-900">{room.rentalDay}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setShowInspectionForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  {room.status === "Cần kiểm tra" ? "Tiến hành kiểm tra" : "Cập nhật kiểm tra"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500">Không tìm thấy phòng nào khớp với từ khóa "{searchQuery}".</p>
        </div>
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Phiếu kiểm tra tình trạng phòng</h2>
              {currentSelectedRoom && (
                <p className="text-sm text-blue-600 mt-1 font-medium">
                  Đang thực hiện cho: {currentSelectedRoom.name} ({currentSelectedRoom.building})
                </p>
              )}
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng tổng thể
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>Rất tốt (Excellent)</option>
                  <option>Tốt (Good)</option>
                  <option>Trung bình (Fair)</option>
                  <option>Kém (Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ sạch sẽ
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option>Sạch sẽ</option>
                  <option>Cần dọn dẹp</option>
                  <option>Bẩn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hư hại ghi nhận
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả các chi tiết bị hư hại hoặc có lỗi..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi phí sửa chữa dự kiến ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh minh chứng (Không bắt buộc)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tải lên hình ảnh kiểm tra phòng</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu bảo trì
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="maintenance"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="maintenance" className="text-sm text-gray-700">
                    Yêu cầu sửa chữa/bảo trì trước khi cho khách mới dọn vào
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInspectionForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Đã lưu kết quả kiểm tra cho ${currentSelectedRoom?.name}!`);
                    setShowInspectionForm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Lưu kết quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}